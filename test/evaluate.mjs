import assert from 'assert';

import * as errors from '../src/errors.mjs';

import evaluate from '../src/evaluate.mjs';

describe('evaluate()', function () {
    describe('Throws an error when arguments\'', function () {
        it('variable-handlers is undefined', function () {
            assert.throws(() => { evaluate(); }, TypeError);
        });
        it('variable-handlers is not an Array', function () {
            assert.throws(() => { evaluate(''); }, TypeError);
        });
        it('options is undefined', function () {
            assert.throws(() => { evaluate([]); }, TypeError)
        });
        it('options.expression is undefined', function () {
            assert.throws(() => { evaluate([], {}); }, TypeError)
        });
        it('options.expression is not a string', function () {
            assert.throws(() => { evaluate([], {expression: null}); }, TypeError)
        });
        it('options.trigger is undefined', function () {
            assert.throws(() => { evaluate([], {expression: ''}); }, TypeError)
        });
        it('options.trigger is null', function () {
            assert.throws(() => { evaluate([], {expression: '', trigger: null}); }, TypeError)
        });
    });

    describe('Input is empty string', function () {
        let result;
        it('does not throw an error', function () {
            result = evaluate([], {trigger: '', expression: ''});
        });
        it('returns a string', function () {
            assert.equal(typeof(result), 'string');
        });
        it('string is empty', function () {
            assert.equal(result, '');
        });
    });

    describe('Input with no significant characters', function () {
        let result;
        it('does not throw an error', function () {
            result = evaluate([], {trigger: '', expression: 'plain text'});
        });
        it('returns a string', function () {
            assert.equal(typeof(result), 'string');
        });
        it('string matches input', function () {
            assert.equal(result, 'plain text');
        });
    });

    describe('Input with escape sequences', function () {
        it('Escapes \\\\', function () {
            assert.equal(evaluate([], {trigger: '', expression: '\\\\'}), '\\');
        });
        it('Escapes \\$', function () {
            assert.equal(evaluate([], {trigger: '', expression: '\\$'}), '$');
        });
        it('Escapes \\"', function () {
            assert.equal(evaluate([], {trigger: '', expression: '\\"'}), '"');
        });
        it('Treats \\ at the end of an expression as a literal', function () {
            assert.equal(evaluate([], {trigger: '', expression: '\\'}), '\\');
        });
        it('Handles leading text', function () {
            assert.equal(evaluate([], {trigger: '', expression: 'text\\\\'}), 'text\\');
        });
        it('Handles trailing text', function () {
            assert.equal(evaluate([], {trigger: '', expression: '\\\\text'}), '\\text');
        });
        it('Treats non-escape-sequences as literal \\', function () {
            assert.equal(evaluate([], {trigger: '', expression: '\\a'}), '\\a');
        });
    });

    describe('Input with quotes', function () {
        it('Throws an error if there is no applicable closing quote', function () {
            assert.throws(() => { evaluate([], {trigger: '', expression: '"'})}, errors.ExpressionSyntaxError);
        });
        it('Returns an empty string for ""', function () {
            assert.equal(evaluate([], {trigger: '', expression: '""'}), '');
        });
        it('Does not include surrounding quotes in result', function () {
            assert.equal(evaluate([], {trigger: '', expression: '"text"'}), 'text');
        });
        it('Treats $ as plain text', function () {
            assert.equal(evaluate([], {trigger: '', expression: '"ltext $var ttext"'}), 'ltext $var ttext')
        });
        it('Escapes \\\\', function () {
            assert.equal(evaluate([], {trigger: '', expression: '"\\\\"'}), '\\');
        });
        it('Escapes \\"', function () {
            assert.equal(evaluate([], {trigger: '', expression: '"\\""'}), '"');
        });
        it('Treats non-escape-sequence as literal \\', function () {
            assert.equal(evaluate([], {trigger: '', expression: '"\\a"'}), '\\a');
        });
        describe('Can be mixed with:', function () {
            it('Plain Text', function () {
                assert.equal(evaluate([], {trigger: '', expression: 'leading"text"'}), 'leadingtext');
                assert.equal(evaluate([], {trigger: '', expression: 'leading "text"'}), 'leading text');
                assert.equal(evaluate([], {trigger: '', expression: '"text"trailing'}), 'texttrailing');
                assert.equal(evaluate([], {trigger: '', expression: '"text" trailing'}), 'text trailing');
                assert.equal(evaluate([], {trigger: '', expression: 'leading"text"trailing'}), 'leadingtexttrailing');
                assert.equal(evaluate([], {trigger: '', expression: 'leading "text"trailing'}), 'leading texttrailing');
                assert.equal(evaluate([], {trigger: '', expression: 'leading"text" trailing'}), 'leadingtext trailing');
                assert.equal(evaluate([], {trigger: '', expression: 'leading "text" trailing'}), 'leading text trailing');
            });
            it('Escape Sequences', function () {
                assert.equal(evaluate([], {trigger: '', expression: '\\$"text"'}), '$text');
                assert.equal(evaluate([], {trigger: '', expression: '\\$ "text"'}), '$ text');
                assert.equal(evaluate([], {trigger: '', expression: '"text"\\\\'}), 'text\\');
                assert.equal(evaluate([], {trigger: '', expression: '"text" \\\\'}), 'text \\');
                assert.equal(evaluate([], {trigger: '', expression: '\\$"text"\\\\'}), '$text\\');
                assert.equal(evaluate([], {trigger: '', expression: '\\$ "text"\\\\'}), '$ text\\');
                assert.equal(evaluate([], {trigger: '', expression: '\\$"text" \\\\'}), '$text \\');
                assert.equal(evaluate([], {trigger: '', expression: '\\$ "text" \\\\'}), '$ text \\');
            });
        });
    });
});