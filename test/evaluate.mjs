import assert from 'assert';

import * as errors from '../src/errors.mjs';

import evaluate from '../src/evaluate.mjs';

const expectThrow = async (fnc, type) => {
    try {
        await fnc();
    } catch (err) {
        if (type && !(err instanceof type)) {
            console.log(err);
            throw new Error(`threw incorrect error: ${err.name}`);
        }
        return;
    }
    throw new Error('did not throw an error');
};

const expectEqual = async (fnc, value) => {
    let result = await fnc();
    assert.equal(result, value);
};

const vars = new Map([
    ['txt', {handle: 'txt', argsCheck: () => {}, evaluator: () => 'evaled_var_text'}],
    ['ten', {handle: 'ten', argsCheck: () => {}, evaluator: () => 10}],
    ['sum', {handle: 'sum', argsCheck: () => {}, evaluator: (meta, ...args) => {
        return args.map(item => Number(item)).reduce((acc, cur) => acc + cur, 0);
    }}]
]);
const options = {
    handlers: vars,
    trigger: ''
};

describe('evaluate()', function () {

    describe('Throws an error when arguments\'', function () {
        it('option is undefined or null', async function () {
            await expectThrow(() => evaluate(), TypeError);
        });
        it('variable-handlers is undefined', async function () {
            await expectThrow(() => evaluate({}), TypeError);
        });
        it('variable-handlers is not a Map', async function () {
            await expectThrow(() => evaluate({handlers: ''}), TypeError);
        });
        it('options.trigger is undefined', async function () {
            await expectThrow(() => evaluate({handlers: vars}), TypeError);
        });
        it('options.trigger is null', async function () {
            await expectThrow(() => evaluate({handlers: vars, trigger: null}), TypeError);
        });
        it('options.expression is undefined', async function () {
            await expectThrow(() => evaluate({handlers: vars, trigger: ''}), TypeError);
        });
        it('options.expression is not a string', async function () {
            await expectThrow(() => evaluate({handlers: vars, trigger: '', expression: true}), TypeError);
        });
    });

    describe('Input is empty string', function () {
        it('does not throw an error', async function () {
            await evaluate({...options, expression: ''});
        });
        it('returns a string', async function () {
            let result = await evaluate({...options, expression: ''});
            assert.equal(typeof(result), 'string');
        });
        it('string is empty', async function () {
            await expectEqual(() => evaluate({...options, expression: ''}), '');
        });
    });

    describe('Input is plain text', function () {
        it('does not throw an error', async function () {
            await evaluate({...options, expression: 'plain text'});
        });
        it('returns a string', async function () {
            let result = await evaluate({...options, expression: 'plain text'});
            assert.equal(typeof(result), 'string');
        });
        it('string matches input', async function () {
            await expectEqual(() => evaluate({...options, expression: 'plain text'}) , 'plain text');
        });
    });

    describe('Input is escape sequences', function () {
        it('Escapes \\\\', async function () {
            await expectEqual(() => evaluate({...options, expression: '\\\\'}), '\\');
        });
        it('Escapes \\$', async function () {
            await expectEqual(() => evaluate({...options, expression: '\\$'}), '$');
        });
        it('Escapes \\"', async function () {
            await expectEqual(() => evaluate({...options, expression: '\\"'}), '"');
        });
        it('Treats \\ at the end of an expression as a literal', async function () {
            await expectEqual(() => evaluate({...options, expression: '\\'}), '\\');
        });
    });

    describe('Input is quoted text', function () {
        it('Throws an error if there is no applicable closing quote', async function () {
            await expectThrow(() => evaluate({...options, expression: '"'}), errors.ExpressionSyntaxError);
        });
        it('Returns text inside of quotes without quation marks', async function () {
            await expectEqual(() => evaluate({...options, expression: '"text"'}), 'text');
        });
        it('Returns an empty string for ""', async function () {
            await expectEqual(() => evaluate({...options, expression: '""'}), '');
        });
        it('Treats $ as plain text', async function () {
            await expectEqual(() => evaluate({...options, expression: '"$var"'}), '$var');
        });
        it('Escapes \\\\', async function () {
            await expectEqual(() => evaluate({...options, expression: '"\\\\"'}), '\\');
        });
        it('Escapes \\"', async function () {
            await expectEqual(() => evaluate({...options, expression: '"\\""'}), '"');
        });
        it('Treats non-escape-sequence as literal \\', async function () {
            await expectEqual(() => evaluate({...options, expression: '"\\a"'}), '\\a');
        });
    });

    describe('Input is a mix of text', async function () {
        it('Plain-text and escape sequences', async function () {
            await expectEqual(() => evaluate({...options, expression: 'text\\\\'}), 'text\\');
            await expectEqual(() => evaluate({...options, expression: '\\\\text'}), '\\text');
            await expectEqual(() => evaluate({...options, expression: 'text\\\\text'}), 'text\\text');
            await expectEqual(() => evaluate({...options, expression: '\\\\text\\\\'}), '\\text\\');
        });
        it('Treats non-escape-sequences as literal \\', async function () {
            await expectEqual(() => evaluate({...options, expression: '\\a'}), '\\a');
        });
        it('Plain-text, escape sequences and quotes', async function () {
            await expectEqual(() => evaluate({...options, expression: 'leading"text"'}), 'leadingtext');
            await expectEqual(() => evaluate({...options, expression: 'leading "text"'}), 'leading text');
            await expectEqual(() => evaluate({...options, expression: '"text"trailing'}), 'texttrailing');
            await expectEqual(() => evaluate({...options, expression: '"text" trailing'}), 'text trailing');
            await expectEqual(() => evaluate({...options, expression: 'leading"text"trailing'}), 'leadingtexttrailing');
            await expectEqual(() => evaluate({...options, expression: 'leading "text"trailing'}), 'leading texttrailing');
            await expectEqual(() => evaluate({...options, expression: 'leading"text" trailing'}), 'leadingtext trailing');
            await expectEqual(() => evaluate({...options, expression: 'leading "text" trailing'}), 'leading text trailing');
            await expectEqual(() => evaluate({...options, expression: '\\$"text"'}), '$text');
            await expectEqual(() => evaluate({...options, expression: '\\$ "text"'}), '$ text');
            await expectEqual(() => evaluate({...options, expression: '"text"\\\\'}), 'text\\');
            await expectEqual(() => evaluate({...options, expression: '"text" \\\\'}), 'text \\');
            await expectEqual(() => evaluate({...options, expression: '\\$"text"\\\\'}), '$text\\');
            await expectEqual(() => evaluate({...options, expression: '\\$ "text"\\\\'}), '$ text\\');
            await expectEqual(() => evaluate({...options, expression: '\\$"text" \\\\'}), '$text \\');
            await expectEqual(() => evaluate({...options, expression: '\\$ "text" \\\\'}), '$ text \\');
        });
    });

    describe('Input is variable', function () {
        it('Treats naked $ as text', async function () {
            await expectEqual(() => evaluate({...options, expression: '$'}), '$');
        });
        it('Treats $<number> as text', async function () {
            await expectEqual(() => evaluate({...options, expression: '$10'}), '$10');
        });
        it('Throws an error if the variable does not exist', async function () {
            await expectThrow(() => evaluate({...options, expression: '$notdefined'}), errors.ExpressionVariableError);
        });
        it('Evaluates variable', async function () {
            await expectEqual(() => evaluate({...options, expression: '$txt'}), 'evaled_var_text');
        });
        it('Evaluates variable with arguments', async function () {
            await expectEqual(() => evaluate({...options, expression: '$sum[1,2]'}), '3');
        });
        it('Evaluates nested variables', async function () {
            await expectEqual(() => evaluate({...options, expression: '$sum[$ten, 1]'}), '11');
        });
        it('Evaluates nested variable with arguments', async function () {
            await expectEqual(() => evaluate({...options, expression: '$sum[$sum[$ten, 1], 1]'}), '12');
        });
    });

    describe('Input is $if', function () {
        it('throws an error if no arguments', async function () {
            await expectThrow(() => evaluate({...options, expression: '$if'}), errors.ExpressionSyntaxError);
        });
        it('Does not throw an error for valid statement', async function () {
            await evaluate({...options, expression: '$if[1 === 1, true, false]'});
        });
        it('Properly evaluates ===', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[1 === 1, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1 === 2, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[1.0 === 1, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a === a, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a === b, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a === A, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[ === , yes, no]'}), 'yes');
        });
        it('Properly evaluates !==', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[1 !== 1, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[1 !== 2, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1.0 !== 1, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a !== a, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a !== b, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a !== A, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[ !== , yes, no]'}), 'no');
        });
        it('Properly evaluates ==', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[1 == 1, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1.0 == 1, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a == a, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a == A, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1 == 2, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a == b, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[ == , yes, no]'}), 'yes');
        });
        it('Properly evaluates !=', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[1 != 1, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[1.0 != 1, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a != a, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a != A, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[1 != 2, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a != b, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[ != , yes, no]'}), 'no');
        });
        it('Properly evaluates <', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[1 < 2, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1.0 < 2, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1 < 2.0, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1 < 1, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a < 1, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[1 < a, yes, no]'}), 'no');
        });
        it('Properly evaluates <=', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[1 <= 2, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1.0 <= 2, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1 <= 2.0, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1 <= 1, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a < 1, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[1 < a, yes, no]'}), 'no');
        });
        it('Properly evaluates >', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[2 > 1, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[2.0 > 1, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[2 > 1.0, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1 > 1, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a > 1, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[1 > a, yes, no]'}), 'no');
        });
        it('Properly evaluates >=', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[2 >= 1, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[2.0 >= 1, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[2 >= 1.0, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1 >= 1, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a > 1, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[1 > a, yes, no]'}), 'no');
        });
        it('Properly evaluates exists', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[a exists, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[ exists, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if["" exists, yes, no]'}), 'no');
        });
        it('Properly evaluates !exists', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[a !exists, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[ !exists, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if["" !exists, yes, no]'}), 'yes');
        });
        it('Properly evaluates isnumber', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[1 isnumber, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[.1 isnumber, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1.1 isnumber, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[-1 isnumber, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[-.1 isnumber, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[-1.1 isnumber, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a isnumber, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if["" isnumber, yes, no]'}), 'no');
        });
        it('Properly evaluates !isnumber', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[1 !isnumber, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[.1 !isnumber, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[1.1 !isnumber, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[-1 !isnumber, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[-.1 !isnumber, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[-1.1 !isnumber, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a !isnumber, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if["" !isnumber, yes, no]'}), 'yes');
        });

    });
});