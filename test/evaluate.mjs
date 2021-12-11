import assert from 'assert';

import * as errors from '../src/errors.mjs';

import evaluate from '../src/evaluate.mjs';

const expectThrow = async (fnc, type) => {
    try {
        await fnc();
    } catch (err) {
        if (type && !(err instanceof type)) {
            throw new Error('threw incorrect error');
        }
        return;
    }
    throw new Error('did not throw an error');
};

const expectEqual = async (fnc, value) => {
    let result = await fnc();
    assert.equal(result, value);
};

const vars = [
    {handle: 'txt', argsCheck: () => {}, evaluator: () => 'evaled_var_text'},
    {handle: 'ten', argsCheck: () => {}, evaluator: () => 10},
    {handle: 'sum', argsCheck: () => {}, evaluator: (meta, ...args) => {
        return args.map(item => Number(item)).reduce((acc, cur) => acc + cur, 0)
    }}
];

describe('evaluate()', function () {

    describe('Throws an error when arguments\'', function () {
        it('variable-handlers is undefined', async function () {
            await expectThrow(() => evaluate(), TypeError);
        });
        it('variable-handlers is not an Array', async function () {
            await expectThrow(() => evaluate(''), TypeError);
        });
        it('options is undefined', async function () {
            await expectThrow(() => evaluate(vars), TypeError);
        });
        it('options.trigger is undefined', async function () {
            await expectThrow(() => evaluate(vars, {}), TypeError);
        });
        it('options.trigger is null', async function () {
            await expectThrow(() => evaluate(vars, {trigger: null}), TypeError);
        });
        it('options.expression is undefined', async function () {
            await expectThrow(() => evaluate(vars, {trigger: ''}), TypeError);
        });
        it('options.expression is not a string', async function () {
            await expectThrow(() => evaluate(vars, {trigger: '', expression: true}), TypeError);
        });
    });

    describe('Input is empty string', function () {
        it('does not throw an error', async function () {
            await evaluate(vars, {trigger: '', expression: ''});
        });
        it('returns a string', async function () {
            let result = await evaluate(vars, {trigger: '', expression: ''});
            assert.equal(typeof(result), 'string');
        });
        it('string is empty', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: ''}), '');
        });
    });

    describe('Input is plain text', function () {
        it('does not throw an error', async function () {
            await evaluate(vars, {trigger: '', expression: 'plain text'});
        });
        it('returns a string', async function () {
            let result = await evaluate(vars, {trigger: '', expression: 'plain text'});
            assert.equal(typeof(result), 'string');
        });
        it('string matches input', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: 'plain text'}) , 'plain text');
        });
    });

    describe('Input is escape sequences', function () {
        it('Escapes \\\\', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\\\'}), '\\');
        });
        it('Escapes \\$', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\$'}), '$');
        });
        it('Escapes \\"', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\"'}), '"');
        });
        it('Treats \\ at the end of an expression as a literal', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\'}), '\\');
        });
    });

    describe('Input is quoted text', function () {
        it('Throws an error if there is no applicable closing quote', async function () {
            await expectThrow(() => evaluate(vars, {trigger: '', expression: '"'}), errors.ExpressionSyntaxError);
        });
        it('Returns text inside of quotes without quation marks', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '"text"'}), 'text');
        });
        it('Returns an empty string for ""', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '""'}), '');
        });
        it('Treats $ as plain text', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '"$var"'}), '$var');
        });
        it('Escapes \\\\', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '"\\\\"'}), '\\');
        });
        it('Escapes \\"', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '"\\""'}), '"');
        });
        it('Treats non-escape-sequence as literal \\', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '"\\a"'}), '\\a');
        });
    });

    describe('Input is variable', function () {
        it('Treats naked $ as text', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '$'}), '$');
        });
        it('Treats $<number> as text', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '$10'}), '$10');
        });
        it('Throws an error if the variable does not exist', async function () {
            await expectThrow(() => evaluate(vars, {trigger: '', expression: '$notdefined'}), errors.ExpressionVariableError);
        });
        it('Evaluates variable', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '$txt'}), 'evaled_var_text');
        });
        it('Evaluates variable with arguments', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '$sum[1,2]'}), '3');
        });
        it('Evaluates nested variables', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '$sum[$ten, 1]'}), '11');
        });
        it('Evaluates nested variable with arguments', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '$sum[$sum[$ten, 1], 1]'}), '12');
        });
    });

    describe('Input is a mix', async function () {
        it('Plain-text and escape sequences', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: 'text\\\\'}), 'text\\');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\\\text'}), '\\text');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: 'text\\\\text'}), 'text\\text');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\\\text\\\\'}), '\\text\\');
        });
        it('Treats non-escape-sequences as literal \\', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\a'}), '\\a');
        });
        it('Plain-text, escape sequences and quotes', async function () {
            await expectEqual(() => evaluate(vars, {trigger: '', expression: 'leading"text"'}), 'leadingtext');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: 'leading "text"'}), 'leading text');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '"text"trailing'}), 'texttrailing');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '"text" trailing'}), 'text trailing');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: 'leading"text"trailing'}), 'leadingtexttrailing');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: 'leading "text"trailing'}), 'leading texttrailing');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: 'leading"text" trailing'}), 'leadingtext trailing');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: 'leading "text" trailing'}), 'leading text trailing');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\$"text"'}), '$text');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\$ "text"'}), '$ text');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '"text"\\\\'}), 'text\\');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '"text" \\\\'}), 'text \\');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\$"text"\\\\'}), '$text\\');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\$ "text"\\\\'}), '$ text\\');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\$"text" \\\\'}), '$text \\');
            await expectEqual(() => evaluate(vars, {trigger: '', expression: '\\$ "text" \\\\'}), '$ text \\');
        });
    });
});