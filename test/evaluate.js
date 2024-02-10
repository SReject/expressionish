/* global describe, it */

const assert = require('assert');

const errors = require('../src/errors.js');

const evaluate = require('../src/evaluate.js');

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

let callCount = 0;
const vars = new Map([
    ['txt', {handle: 'txt', argsCheck: () => {}, evaluator: () => 'evaled_var_text'}],
    ['ten', {handle: 'ten', argsCheck: () => {}, evaluator: () => 10}],
    ['sum', {handle: 'sum', argsCheck: () => {}, evaluator: (meta, ...args) => {
        return args.map(item => Number(item)).reduce((acc, cur) => acc + cur, 0);
    }}],
    ['inout', {handle: 'inout', argsCheck: () => {}, evaluator: (meta, ...args) => args.join('') }],
    ['iftrue', {handle: 'iftrue', argCheck: () => {}, evaluator: () => true }],
    ['iffalse', {handle: 'iffalse', argCheck: () => {}, evaluator: () => false }],
    ['onlytrue', {handle: 'iftrue', argCheck: () => {}, evaluator: () => { callCount += 1; return true }}],
    ['onlyfalse', {handle: 'iffalse', argCheck: () => {}, evaluator: () => { callCount += 1; return false }}],
    ['json', {handle: 'json', argCheck: () => {}, evaluator: () => ({key: "value"}) }],
    ['walk', { handle: 'walk', argCheck: () => {}, evaluator: (meta, json, prop) => json[prop] }]
]);
const options = {
    handlers: vars
};

describe('evaluate()', function () {

    describe('Throws an error when arguments\'', function () {
        it('option is undefined or null', async function () {
            await expectThrow(() => evaluate(), TypeError);
        });
        it('variable-handlers is undefined', async function () {
            await expectThrow(() => evaluate({expression: ''}), TypeError);
        });
        it('variable-handlers is not a Map', async function () {
            await expectThrow(() => evaluate({handlers: '', expression: ''}), TypeError);
        });
        it('options.expression is undefined', async function () {
            await expectThrow(() => evaluate({handlers: vars }), TypeError);
        });
        it('options.expression is not a string', async function () {
            await expectThrow(() => evaluate({handlers: vars, expression: true}), TypeError);
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
        it('treats root-level quotes as literals', async function () {
            await expectEqual(() => evaluate({...options, expression: '"text"'}), '"text"');
        });
        it('treats root-level double backticks as literals', async function () {
            await expectEqual(() => evaluate({...options, expression: '``text``'}), '``text``');
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
        it('Calls global preeval() hook', async function () {
            let testCallCount = 0;
            await evaluate({ ...options, preeval: async () => { testCallCount += 1; }, expression: '$txt' });
            expectEqual(testCallCount, 1);
        });
        it('Calls variable-specific preeval() hook', async function () {
            let testCallCount = 0;
            await evaluate({ handlers: new Map(Object.entries({ 'txt': { handle: 'txt', argCheck: () => {}, preeval: () => { testCallCount += 1 }, evaluator: () => 'evaled_var_text' }})), expression: '$txt'});
            expectEqual(testCallCount, 1);
        })
        it('Evaluates variable with arguments', async function () {
            await expectEqual(() => evaluate({...options, expression: '$sum[1,2]'}), '3');
        });
        it('Evaluates nested variables', async function () {
            await expectEqual(() => evaluate({...options, expression: '$sum[$ten, 1]'}), '11');
        });
        it('Evaluates nested variable with arguments', async function () {
            await expectEqual(() => evaluate({...options, expression: '$sum[$sum[$ten, 1], 1]'}), '12');
        });
        it('Evaluates quoted text in arguments to plain text', async function () {
            await expectEqual(() => evaluate({...options, expression: '$inout["text"]'}), 'text');
        });
        it('Block-escapes text in double backticks', async function () {
            await expectEqual(() => evaluate({...options, expression: '$inout[``"text"``]'}), '"text"');
        });
        it('Evaluates vars in block escapes', async function () {
            await expectEqual(() => evaluate({...options, expression: '$inout[``"$ten"``]'}), '"10"');
        });
        it('Handles multiline block escapes with commas, brackets, etc', async function () {
            const testCase = `[a,b]\nc[]`;
            await expectEqual(() => evaluate({
                ...options,
                expression: '$inout[``' + testCase + '``]'
            }), testCase);
        })
        it('Evaluates and passes instances without stringification', async function () {
            await expectEqual(() => evaluate({ ...options, expression: '$walk[$json, key]'}), "value")
        });
    });

    describe('Input is lookup', function () {
        it('Lookups up handler', async function () {
            let testCallCount = 0;
            const result = await evaluate({
                ...options,
                lookups: new Map(Object.entries({
                    '&': () => {
                        return {
                            evaluator: () => {
                                return "value for &test"
                            }
                        }
                    }
                })),
                expression: "&test"
            });
            expectEqual(result, "value for &test");
            expectEqual(testCallCount, 1);
        });
    });

    describe('Input is $if', function () {
        it('throws an error if no arguments', async function () {
            await expectThrow(() => evaluate({...options, expression: '$if'}), errors.ExpressionSyntaxError);
        });
        it('Does not throw an error for valid statement', async function () {
            await evaluate({...options, expression: '$if[1 === 1, true, false]'});
        });
        it('Only evaluates the argument respective of condition result', async () => {
            await evaluate({ ...options, expression: '$if[1 === 1, $onlytrue, $onlyFalse]' });
            if (callCount !== 1) {
                throw new Error('call count did not equal 1')
            }
        });
    });

    describe('Input is $if with comparison operator', function () {
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
        it('Properly evaluates isnumber range', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[0 isnumber 1-3, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[1 isnumber 1-3, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[2 isnumber 1-3, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[3 isnumber 1-3, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[4 isnumber 1-3, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[1.5 isnumber 1-2, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a isnumber 1-2, yes, no]'}), 'no');
        });
        it('Properly evaluates !isnumber range', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[0 !isnumber 1-3, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1 !isnumber 1-3, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[2 !isnumber 1-3, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[3 !isnumber 1-3, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[4 !isnumber 1-3, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[1.5 !isnumber 1-2, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a !isnumber 1-2, yes, no]'}), 'yes');
        });
        it('Properly evaluates regex', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[a regex /a/, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[A regex /a/i, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a regex /b/, yes, no]'}), 'no');
        });
        it('Properly evaluates !regex', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[a !regex /a/, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[A !regex /a/i, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a !regex /b/, yes, no]'}), 'yes');
        });
        it('Properly evaluates iswcm', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[a iswcm a, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[z iswcm a, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[ab iswcm a?, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[bc iswcm a?, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[abc iswcm a?c, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[ac iswcm a?c, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[a iswcm a*, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[ab iswcm a*, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[ab iswcm *b*, yes, no]'}), 'yes');
        });
        it('Properly evaluates !iswcm', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[a !iswcm a, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[z !iswcm a, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[ab !iswcm a?, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[bc !iswcm a?, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[abc !iswcm a?c, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[ac !iswcm a?c, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[a !iswcm a*, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[ab !iswcm a*, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[ab !iswcm *b*, yes, no]'}), 'no');
        });
        it('Properly evaluates iswcmcs', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[ab iswcmcs a?, yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[Ab iswcmcs a?, yes, no]'}), 'no');
        });
        it('Properly evaluates !iswcmcs', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[ab !iswcmcs a?, yes, no]'}), 'no');
            await expectEqual(() => evaluate({...options, expression: '$if[Ab !iswcmcs a?, yes, no]'}), 'yes');
        });
    });

    describe('Input is $if with logical operator', function () {
        it('Properly evaluates $ALL', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[$ALL[1 === 1], yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[$ALL[1 === 1, 2 === 2], yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[$ALL[1 === 1, 2 === 3], yes, no]'}), 'no');
        });
        it('Properly evaluates $ANY', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[$ANY[1 === 1], yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[$ANY[1 === 2, 2 === 2], yes, no]'}), 'yes');
            await expectEqual(() => evaluate({...options, expression: '$if[$ANY[1 === 2, 2 === 3], yes, no]'}), 'no');
        });
        it('Properly evaluates $NOT', async function () {
            await expectEqual(() => evaluate({...options, expression: '$if[$NOT[1 === 1], yes, no]'}), 'no');
        });
    });

    describe('Input is $if with a singleton condition', function () {
        it('returns truthy if condition is true', async function () {
            await expectEqual(() => evaluate({ ...options, expression: '$if[$iftrue, yes, no]'}), 'yes')
        });
        it('returns falsey if condition is false', async function () {
            await expectEqual(() => evaluate({ ...options, expression: '$if[$iffalse, yes, no]'}), 'no')
        });
    });

    describe('Input all the things', function () {
        it('Properly evaluates all the things', async function () {
            const expression = `a \\b \\$ "c \\d \\"" $ten $sum[$ten, 1] $if[$NOT[$AND[1 === 1, $ten == 9]], 12, -1]\\`
            const expect = `a \\b $ "c \\d "" 10 11 12\\`
            await expectEqual(() => evaluate({...options, expression}), expect);
        });
    });
});