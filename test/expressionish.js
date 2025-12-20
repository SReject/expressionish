/* global describe, it */

import assert from 'node:assert';

import {
    ExpressionArgumentsError,
    ExpressionSyntaxError,
    ExpressionVariableError,

    ArgumentsToken,
    ComparisonToken,
    IfToken,
    LogicToken,
    LookupToken,
    RootToken,
    SequenceToken,
    TextToken,
    VariableToken,

    tokenize,
} from '../dist/expressionish.mjs';

const expectThrow = async (fnc, type) => {
    try {
        await fnc();
    } catch (err) {
        if (type && !(err instanceof type)) {
            throw new Error(`threw incorrect error - Actual: ${err.name} - Expected: ${type.name}`);
        }
        return;
    }
    throw new Error('did not throw an error');
};
const expectEqual = async (value, equals) => {
    if (typeof value === 'function') {
        value = await value();
    }
    assert.equal(value, equals);
};
const expectInstance = async (value, instance) => {
    if (typeof value === 'function') {
        value = await value();
    }
    assert.equal(value instanceof instance, true);
}
const tokenizeAndValidate = async (expression, childType, equals) => {
    const root = tokenize({ variables, lookups, expression });
    await expectInstance(root, RootToken);
    await expectEqual(root.value.length, 1);

    const child = root.value[0];
    if (childType) {
        await expectInstance(child, childType);
        if (equals != null) {
            await expectEqual(child.value, equals);
        }
    }
    return child;
}
const validateComparison = async function (operator) {
    const child = await tokenizeAndValidate(`$if[ a ${operator} b, true, false]`, IfToken);

    const cond = child.value;
    await expectInstance(cond, ComparisonToken);
    await expectEqual(cond.value, operator);

    const left = cond.left;
    await expectInstance(left, TextToken);
    await expectEqual(left.value, 'a');

    const right = cond.right;
    await expectInstance(right, TextToken);
    await expectEqual(right.value, 'b');

    const whenTrue = child.whenTrue;
    await expectInstance(whenTrue, TextToken);
    await expectEqual(whenTrue.value, 'true');

    const whenFalse = child.whenFalse;
    await expectInstance(whenFalse, TextToken);
    await expectEqual(whenFalse.value, 'false');
}


const variables = new Map([
    ['null', { maxArgumentsAmount: 0, evaluate: async () => null }],
    ['true', { maxArgumentsAmount: 0, evaluate: async () => true }],
    ['false', { maxArgumentsAmount: 0, evaluate: async () => false }],
    ['text', { evaluate: async () => 'text_value' }],
    ['ret', { evaluate: async (meta, input) => input }],
    ['sum', { evaluate: async (meta, ...args) => args.reduce((prev, curr) => prev + Number(curr), 0) }],
]);
const lookups = new Map([
    ["&", async (meta, name) => {
        return variables.get(name);
    }]
]);


describe('tokenize() throws an error when TokenizeOptions...', async function () {
    it('Is undefined', async function() {
        await expectThrow(() => tokenize(), TypeError);
    });
    it('Is null', async function() {
        await expectThrow(() => tokenize(null), TypeError);
    });
    it('.variables is undefined', async function () {
        await expectThrow(() => tokenize({}), TypeError);
    });
    it('.variables is null', async function () {
        await expectThrow(() => tokenize({ variables: null }), TypeError);
    });
    it('.variables is not a Map instance', async function () {
        await expectThrow(() => tokenize({ variables: [] }), TypeError);
    });
    it('.lookups is defined but not a Map instance', async function () {
        await expectThrow(() => tokenize({ variables, lookups: [] }));
    });
    it('.expression is undefined', async function () {
        await expectThrow(() => tokenize({ variables }));
    });
    it('.expression is null', async function () {
        await expectThrow(() => tokenize({ variables, expression: null }));
    });
    it('.expression is not a string', async function () {
        await expectThrow(() => tokenize({ variables, expression: 1 }));
    });
});

describe('Expression is an empty string', async function () {
    it('Does not throw an error', async function () {
        tokenize({ variables, expression: '' });
    });
    it('Returns an empty RootToken', async function () {
        const root = tokenize({ variables, expression: '' });
        await expectInstance(root, RootToken);
        await expectEqual(root.value.length, 0);
    });
    it('Evaluates to undefined', async function () {
        const root = tokenize({ variables, expression: '' });
        const result = await root.evaluate();
        await expectEqual(result, undefined);
    });
});

describe('Expression is plain text', async function () {
    const expression = 'text';
    it('Does not throw an error', async function () {
        tokenize({ variables, expression });
    });
    it('Returns a RootToken with a singular TextToken value', async function () {
        await tokenizeAndValidate(expression, TextToken, expression);
    });
    it('Evaluates to input value', async function () {
        const root = tokenize({ variables, expression });
        const result = await root.evaluate();
        await expectEqual(result, expression);
    });
});

describe('Expression is a singular-character escape sequence', async function () {
    it('Returns correct value for \\"', async function () {
        const result = await tokenize({ variables, expression: '\\"'}).evaluate();
        await expectEqual(result, '"');
    });
    it('Returns correct value for \\\\', async function () {
        const result = await tokenize({ variables, expression: '\\\\'}).evaluate();
        await expectEqual(result, '\\');
    });
    it('Returns correct value for \\$', async function () {
        const result = await tokenize({ variables, expression: '\\$'}).evaluate();
        await expectEqual(result, '$');
    });
    it('Returns correct value for \\``', async function () {
        const result = await tokenize({ variables, expression: '\\``'}).evaluate();
        await expectEqual(result, '``');
    });
    it('Returns correct value for \\n', async function () {
        const result = await tokenize({ variables, expression: '\\n'}).evaluate();
        await expectEqual(result, '\n');
    });
    it('Returns correct value for \\r', async function () {
        const result = await tokenize({ variables, expression: '\\r'}).evaluate();
        await expectEqual(result, '\r');
    });
    it('Returns correct value for \\t', async function () {
        const result = await tokenize({ variables, expression: '\\t'}).evaluate();
        await expectEqual(result, '\t');
    });
    it('Treats \\ as a literal backslash when at the end of an expression', async function () {
        const result = await tokenize({ variables, expression: '\\'}).evaluate();
        await expectEqual(result, '\\');
    });
    it('Treats \\ as a literal backslash when followed by non-escape sequence', async function () {
        const result = await tokenize({ variables, expression: '\\a'}).evaluate();
        await expectEqual(result, '\\a');
    });
});

describe('Expression is a potential variable', async function () {
    it('Treats naked $ as plain text', async function () {
        await tokenizeAndValidate('$', TextToken, '$');
    });
    it('Treats $<number> as literal text', async function () {
        await tokenizeAndValidate('$1', TextToken, '$1');
    });
    it('Throws an ExpressionVariableError if the variable is not defined', async function () {
        await expectThrow(async () => {
            tokenize({ variables, expression: '$invalidVariable' });
        }, ExpressionVariableError)
    });
    it('Tokenizes a variable that does not have arguments', async function () {
        const child = await tokenizeAndValidate('$text', VariableToken, 'text');
        await expectEqual(child.arguments, undefined);
    });
    it('Tokenizes a variable with simple arguments', async function () {
        const child = await tokenizeAndValidate('$ret[1,2]', VariableToken, 'ret');
        await expectInstance(child.arguments, ArgumentsToken);

        const args = child.arguments.value;
        await expectEqual(args.length, 2);
        await expectInstance(args[0], TextToken);
        await expectInstance(args[1], TextToken);
        await expectEqual(args[0].value, '1');
        await expectEqual(args[1].value, '2');
    });
    it('Tokenizes nested variables', async function () {
        const child = await tokenizeAndValidate('$ret[$text]', VariableToken, 'ret');
        await expectInstance(child.arguments, ArgumentsToken);

        const args = child.arguments.value;
        await expectEqual(args.length, 1);
        await expectInstance(args[0], VariableToken);
        await expectEqual(args[0].value, 'text');
    });
    describe('Evaluation', async function () {
        it('Evaluates a variable without an arguments-bloc', async function () {
            let result = await tokenize({ variables, expression: '$text'}).evaluate();
            await expectEqual(result, 'text_value');
        });
        it('Evaluates a variable with an arguments-bloc', async function () {
            let result = await tokenize({ variables, expression: '$sum[1,2]'}).evaluate();
            await expectEqual(result, 3);
        });
        it('Evaluates nested variables', async function () {
            let result = await tokenize({ variables, expression: '$ret[$sum[1,2]]'}).evaluate();
            await expectEqual(result, 3);
        });
        it('Calls evaluate-specific .preeval() function', async function () {
            let count = 0;
            const preeval = () => { count += 1 };

            let result = await tokenize({ variables, expression: '$text'}).evaluate({ preeval });
            await expectEqual(result, 'text_value');
            await expectEqual(count, 1);
        });
        it('Calls variable-specific .preeval() function', async function () {
            let count = 0;
            const variables = new Map([
                ['text', {
                    preeval: () => { count += 1 },
                    evaluate: () => 'text_value'
                }]
            ])

            let result = await tokenize({ variables, expression: '$text'}).evaluate();
            await expectEqual(result, 'text_value');
            await expectEqual(count, 1);
        });
        it('Calls variable.argsCheck()', async function () {
            let count = 0;
            const variables = new Map([
                ['ret', {
                    argsCheck: () => { count += 1 },
                    evaluate: (data, arg) => arg
                }]
            ]);

            let result = await tokenize({variables, expression: '$ret[text_value]'}).evaluate();
            await expectEqual(result, 'text_value');
            await expectEqual(count, 1);
        });
        it('Doesn\'t call .evaluate() when .onlyValidate is specified', async function () {
            let count = 0;
            const variables = new Map([
                ['text', {
                    evaluate: () => { count += 1; return 'text_valid'}
                }]
            ]);

            const result = await tokenize({variables, expression: '$text'}).evaluate({ onlyValidate: true });
            await expectEqual(result, undefined);
            await expectEqual(count, 0);
        });
    });
});

describe('Expression is a potential lookup', async function () {
    it('Ignores prefixes that aren\'t defined in lookups', async function () {
        await tokenizeAndValidate('$@prefix_test_0', TextToken, '$@prefix_test_0');
    });
    it('Throws an error when the expression ends abruptly after opening [', async function () {
        await expectThrow(async () => {
            tokenize({ variables, lookups, expression: '$&ret['});
        }, ExpressionSyntaxError);
    });
    it('Throws an error when the expression ends abruptly after the first argument\'s delimiter(,)', async function () {
        await expectThrow(async () => {
            tokenize({ variables, lookups, expression: '$ret[a,'});
        }, ExpressionSyntaxError);
    });
    it('Tokenizes and evaluates lookups that do not have arguments ', async function () {
        const root = tokenize({variables, lookups, expression: '$&text' });
        await expectInstance(root, RootToken);
        await expectEqual(root.value.length, 1);

        const child = root.value[0];
        await expectInstance(child, LookupToken);
        await expectEqual(child.prefix, '&');
        await expectEqual(child.value, 'text');
        await expectEqual(child.arguments, undefined);

        const result = await root.evaluate();
        await expectEqual(result, 'text_value');
    });
    it('Tokenizes and evaluates lookups that have a singular argument', async function () {
        const root = tokenize({variables, lookups, expression: '$&ret[text_value]' });
        await expectInstance(root, RootToken);
        await expectEqual(root.value.length, 1);

        const child = root.value[0];
        await expectInstance(child, LookupToken);
        await expectEqual(child.prefix, '&');
        await expectEqual(child.value, 'ret');
        await expectInstance(child.arguments, ArgumentsToken);

        const args = child.arguments.value;
        await expectEqual(args.length, 1);
        await expectInstance(args[0], TextToken);
        await expectEqual(args[0].value, 'text_value');

        const result = await root.evaluate();
        await expectEqual(result, 'text_value');
    });
    it('Tokenizes and evaluates lookups that have multiple arguments', async function () {
        const root = tokenize({variables, lookups, expression: '$&sum[1,2]' });
        await expectInstance(root, RootToken);
        await expectEqual(root.value.length, 1);

        const child = root.value[0];
        await expectInstance(child, LookupToken);
        await expectEqual(child.prefix, '&');
        await expectEqual(child.value, 'sum');
        await expectInstance(child.arguments, ArgumentsToken);

        const args = child.arguments.value;
        await expectEqual(args.length, 2);
        await expectInstance(args[0], TextToken);
        await expectEqual(args[0].value, '1');
        await expectInstance(args[1], TextToken);
        await expectEqual(args[1].value, '2');

        const result = await root.evaluate();
        await expectEqual(result, 3);
    });
});

describe('Expression is potential $if[] statement', async function () {
    it('Throws an error when no arguments-bloc is specified', async function () {
        await expectThrow(async () => {
            tokenize({ variables, lookups, expression: '$if'});
        }, ExpressionArgumentsError);
    });
    it('Throws an error when the expression ends abruptly after opening [', async function () {
        await expectThrow(async () => {
            tokenize({ variables, lookups, expression: '$if['});
        }, ExpressionSyntaxError);
    });
    it('Throws an error when expression ends immediately after condition', async function () {
        await expectThrow(async () => {
            tokenize({ variables, lookups, expression: '$if[a'});
        }, ExpressionSyntaxError);
    });
    it('Throws an error when expression ends after the condition\'s delimiter(,)', async function () {
        await expectThrow(async () => {
            tokenize({ variables, lookups, expression: '$if[a,'});
        }, ExpressionSyntaxError);
    });
    it('Throws an error when no condition is specified', async function () {
        await expectThrow(async () => {
            tokenize({ variables, lookups, expression: '$if[,]'});
        }, ExpressionArgumentsError);
    });
    it('Throws an error when only the condition is specified', async function () {
        await expectThrow(async () => {
            tokenize({ variables, lookups, expression: '$if[a]'});
        }, ExpressionArgumentsError);
    });
    it('Defaults to \'istruthy\' when no conditional operator is specified', async function () {
        const child = await tokenizeAndValidate('$if[a, true]', IfToken);
        await expectInstance(child.value, ComparisonToken);
        await expectEqual(child.value.value, 'istruthy');
    });
    it('Tokenizes when only conditional and the whenTrue argument is specified', async function () {
        const child = await tokenizeAndValidate('$if[a, true]', IfToken);
        await expectInstance(child.value, ComparisonToken);
        await expectEqual(child.value.value, 'istruthy');
        await expectInstance(child.whenTrue, TextToken);
        await expectEqual(child.whenTrue.value, 'true');
    });
    it('Tokenizes when the conditional, whenTrue and whenFalse arguments are specified', async function () {
        const child = await tokenizeAndValidate('$if[a, true, false]', IfToken);
        await expectInstance(child.value, ComparisonToken);
        await expectEqual(child.value.value, 'istruthy');
        await expectInstance(child.whenTrue, TextToken);
        await expectEqual(child.whenTrue.value, 'true');
        await expectInstance(child.whenFalse, TextToken);
        await expectEqual(child.whenFalse.value, 'false');
    });

    describe('Comparison Operator: istruthy', async function () {
        it('Throws an error when right-hand-side is specified', async function () {
            await expectThrow(async () => {
                tokenize({ variables, expression: '$if[ a istruthy b, true, false]'}, ExpressionArgumentsError);
            })
        });
        it('Tokenizes', async function () {
            const root = tokenize({ variables, expression: '$if[$true istruthy, true, false]'});
            await expectInstance(root, RootToken);
            await expectEqual(root.value.length, 1);

            const child = root.value[0];
            await expectInstance(child, IfToken);

            const cond = child.value;
            await expectInstance(cond, ComparisonToken);
            await expectEqual(cond.value, 'istruthy');

            const whenTrue = child.whenTrue;
            await expectInstance(whenTrue, TextToken, 'true');

            const whenFalse = child.whenFalse;
            await expectInstance(whenFalse, TextToken, 'false');
        });
        it('Evaluates', async function () {
            let result = await tokenize({ variables, expression: '$if[$true istruthy, true, false]'}).evaluate();
            await expectEqual(result, 'true');

            result = await tokenize({ variables, expression: '$if[$false istruthy, true, false]'}).evaluate();
            await expectEqual(result, 'false');
        });
    });

    describe('Comparison Operator: !istruthy', async function () {
        it('Throws an error when right-hand-side is specified', async function () {
            await expectThrow(async () => {
                tokenize({ variables, expression: '$if[ a !istruthy b, true, false]'}, ExpressionArgumentsError);
            })
        });
        it('Tokenizes', async function () {
            const root = tokenize({ variables, expression: '$if[$true !istruthy, true, false]'});
            await expectInstance(root, RootToken);
            await expectEqual(root.value.length, 1);

            const child = root.value[0];
            await expectInstance(child, IfToken);

            const cond = child.value;
            await expectInstance(cond, ComparisonToken);
            await expectEqual(cond.value, '!istruthy');

            const whenTrue = child.whenTrue;
            await expectInstance(whenTrue, TextToken, 'true');

            const whenFalse = child.whenFalse;
            await expectInstance(whenFalse, TextToken, 'false');
        });
        it('Evaluates', async function () {
            let result = await tokenize({ variables, expression: '$if[$true !istruthy, true, false]'}).evaluate();
            await expectEqual(result, 'false');

            result = await tokenize({ variables, expression: '$if[$false !istruthy, true, false]'}).evaluate();
            await expectEqual(result, 'true');
        });
    });

    describe('Comparison Operator: ===', async function () {
        it('Throws an error when right-hand-side is not specified', async function () {
            await expectThrow(async () => {
                tokenize({ variables, expression: '$if[ a ===, true, false ]'}, ExpressionArgumentsError);
            });
        });
        it('Tokenizes', async function () {
            await validateComparison('===');
        });
        it('Evaluates', async function () {
            let result = await tokenize({ variables, expression: '$if[ a === a, true, false]'}).evaluate();
            await expectEqual(result, 'true');

            result = await tokenize({ variables, expression: '$if[ 1 === 1, true, false]'}).evaluate();
            await expectEqual(result, 'true');

            result = await tokenize({ variables, expression: '$if[ a === 1, true, false]'}).evaluate();
            await expectEqual(result, 'false');

            result = await tokenize({ variables, expression: '$if[ a === 1.0, true, false]'}).evaluate();
            await expectEqual(result, 'false');

            result = await tokenize({ variables, expression: '$if[ 1 === 1.0, true, false]'}).evaluate();
            await expectEqual(result, 'true');

            result = await tokenize({ variables, expression: '$if[ 1.0 === 1, true, false]'}).evaluate();
            await expectEqual(result, 'true');
        });
    });

    describe('Comparison Operator: !==', async function () {
        it('Throws an error when right-hand-side is not specified', async function () {
            await expectThrow(async () => {
                tokenize({ variables, expression: '$if[ a !==, true, false ]'}, ExpressionArgumentsError);
            });
        });
        it('Tokenizes', async function () {
            await validateComparison('!==');
        });
        it('Evaluates', async function () {
            let result = await tokenize({ variables, expression: '$if[ a !== a, true, false]'}).evaluate();
            await expectEqual(result, 'false');

            result = await tokenize({ variables, expression: '$if[ 1 !== 1, true, false]'}).evaluate();
            await expectEqual(result, 'false');

            result = await tokenize({ variables, expression: '$if[ a !== 1, true, false]'}).evaluate();
            await expectEqual(result, 'true');

            result = await tokenize({ variables, expression: '$if[ a !== 1.0, true, false]'}).evaluate();
            await expectEqual(result, 'true');

            result = await tokenize({ variables, expression: '$if[ 1 !== 1.0, true, false]'}).evaluate();
            await expectEqual(result, 'false');

            result = await tokenize({ variables, expression: '$if[ 1.0 !== 1, true, false]'}).evaluate();
            await expectEqual(result, 'false');
        });
    });

    describe('Comparison Operator: <', async function () {
        it('Throws an error when right-hand-side is not specified', async function () {
            await expectThrow(async () => {
                tokenize({ variables, expression: '$if[ a <, true, false ]'}, ExpressionArgumentsError);
            });
        });
        it('Tokenizes', async function () {
            await validateComparison('<');
        });
        it('Evaluates', async function () {
            let result = await tokenize({variables, expression: '$if[ 1 < 2, true, false ]'}).evaluate();
            expectEqual(result, 'true');

            result = await tokenize({variables, expression: '$if[ 1 < 1.1, true, false ]'}).evaluate();
            expectEqual(result, 'true');

            result = await tokenize({variables, expression: '$if[ 1 < 1, true, false ]'}).evaluate();
            expectEqual(result, 'false');

            result = await tokenize({variables, expression: '$if[ 2 < 1, true, false ]'}).evaluate();
            expectEqual(result, 'false');

            result = await tokenize({variables, expression: '$if[ a < 1, true, false ]'}).evaluate();
            expectEqual(result, 'false');

            result = await tokenize({variables, expression: '$if[ 1 < a, true, false ]'}).evaluate();
            expectEqual(result, 'false');
        });
    });

    describe('Comparison Operator: <=', async function () {
        it('Throws an error when right-hand-side is not specified', async function () {
            await expectThrow(async () => {
                tokenize({ variables, expression: '$if[ a <=, true, false ]'}, ExpressionArgumentsError);
            });
        });
        it('Tokenizes', async function () {
            await validateComparison('<=');
        });
        it('Evaluates', async function () {
            let result = await tokenize({variables, expression: '$if[ 1 <= 2, true, false ]'}).evaluate();
            expectEqual(result, 'true');

            result = await tokenize({variables, expression: '$if[ 1 <= 1.1, true, false ]'}).evaluate();
            expectEqual(result, 'true');

            result = await tokenize({variables, expression: '$if[ 1 <= 1, true, false ]'}).evaluate();
            expectEqual(result, 'true');

            result = await tokenize({variables, expression: '$if[ 2 <= 1, true, false ]'}).evaluate();
            expectEqual(result, 'false');

            result = await tokenize({variables, expression: '$if[ a <= 1, true, false ]'}).evaluate();
            expectEqual(result, 'false');

            result = await tokenize({variables, expression: '$if[ 1 <= a, true, false ]'}).evaluate();
            expectEqual(result, 'false');
        });
    });

    describe('Comparison Operator: >', async function () {
        it('Throws an error when right-hand-side is not specified', async function () {
            await expectThrow(async () => {
                tokenize({ variables, expression: '$if[ a >, true, false ]'}, ExpressionArgumentsError);
            });
        });
        it('Tokenizes', async function () {
            await validateComparison('>');
        });
        it('Evaluates', async function () {
            let result = await tokenize({variables, expression: '$if[ 2 > 1, true, false ]'}).evaluate();
            expectEqual(result, 'true');

            result = await tokenize({variables, expression: '$if[ 1.1 > 1, true, false ]'}).evaluate();
            expectEqual(result, 'true');

            result = await tokenize({variables, expression: '$if[ 1 > 1, true, false ]'}).evaluate();
            expectEqual(result, 'false');

            result = await tokenize({variables, expression: '$if[ 1 > 2, true, false ]'}).evaluate();
            expectEqual(result, 'false');

            result = await tokenize({variables, expression: '$if[ a > 1, true, false ]'}).evaluate();
            expectEqual(result, 'false');

            result = await tokenize({variables, expression: '$if[ 1 > a, true, false ]'}).evaluate();
            expectEqual(result, 'false');
        });
    });

    describe('Comparison Operator: >=', async function () {
        it('Throws an error when right-hand-side is not specified', async function () {
            await expectThrow(async () => {
                tokenize({ variables, expression: '$if[ a >=, true, false ]'}, ExpressionArgumentsError);
            });
        });
        it('Tokenizes', async function () {
            await validateComparison('>=');
        });
        it('Evaluates', async function () {
            let result = await tokenize({variables, expression: '$if[ 2 >= 1, true, false ]'}).evaluate();
            expectEqual(result, 'true');

            result = await tokenize({variables, expression: '$if[ 1.1 >= 1, true, false ]'}).evaluate();
            expectEqual(result, 'true');

            result = await tokenize({variables, expression: '$if[ 1 >= 1, true, false ]'}).evaluate();
            expectEqual(result, 'true');

            result = await tokenize({variables, expression: '$if[ 1 >= 2, true, false ]'}).evaluate();
            expectEqual(result, 'false');

            result = await tokenize({variables, expression: '$if[ a >= 1, true, false ]'}).evaluate();
            expectEqual(result, 'false');

            result = await tokenize({variables, expression: '$if[ 1 >= a, true, false ]'}).evaluate();
            expectEqual(result, 'false');
        });
    });

    describe('Logical Operator: $and', async function () {
        it('Throws an error when used without an arguments-bloc', async function () {
            await expectThrow(async () => {
                tokenize({ variables, lookups, expression: '$if[$and]'});
            }, ExpressionSyntaxError);
        });
        it('Throws an error when used with an empty arguments-bloc', async function () {
            await expectThrow(async () => {
                tokenize({ variables, lookups, expression: '$if[$and[]]'});
            }, ExpressionArgumentsError);
        });
        it('Tokenizes', async function () {
            const child = await tokenizeAndValidate('$if[$and[a,b], true, false]', IfToken);

            const cond = child.value;
            await expectInstance(cond, LogicToken);
            await expectEqual(cond.value, 'and');
            await expectInstance(cond.arguments, ArgumentsToken);

            const args = cond.arguments.value;
            await expectEqual(args.length, 2);
            await expectInstance(args[0], ComparisonToken);
            await expectEqual(args[0].value, 'istruthy');
            await expectInstance(args[0].left, TextToken);
            await expectEqual(args[0].left.value, 'a');
            await expectEqual(args[0].right, undefined);
            await expectInstance(args[1], ComparisonToken);
            await expectEqual(args[1].value, 'istruthy');
            await expectInstance(args[1].left, TextToken);
            await expectEqual(args[1].left.value, 'b');
            await expectEqual(args[1].right, undefined);

            const whenTrue = child.whenTrue;
            await expectInstance(whenTrue, TextToken);
            await expectEqual(whenTrue.value, 'true');

            const whenFalse = child.whenFalse;
            await expectInstance(whenFalse, TextToken);
            await expectEqual(whenFalse.value, 'false');
        });
        it('Evaluates', async function () {
            let result = await tokenize({ variables, expression: '$if[ $and[ $true ], true, false]'}).evaluate();
            await expectEqual(result, 'true');

            result = await tokenize({ variables, expression: '$if[ $and[ $false ], true, false]'}).evaluate();
            await expectEqual(result, 'false');

            result = await tokenize({ variables, expression: '$if[ $and[ $true, $true ], true, false]'}).evaluate();
            await expectEqual(result, 'true');

            result = await tokenize({ variables, expression: '$if[ $and[ $true, $false ], true, false]'}).evaluate();
            await expectEqual(result, 'false');

            result = await tokenize({ variables, expression: '$if[ $and[ $true, $false, $true ], true, false]'}).evaluate();
            await expectEqual(result, 'false');
        });
    });

    describe('Logical Operator: $or', async function () {
        it('Throws an error when used without an arguments-bloc', async function () {
            await expectThrow(async () => {
                tokenize({ variables, lookups, expression: '$if[$or]'});
            }, ExpressionSyntaxError);
        });
        it('Throws an error when used with an empty arguments-bloc', async function () {
            await expectThrow(async () => {
                tokenize({ variables, lookups, expression: '$if[$or[]]'});
            }, ExpressionArgumentsError);
        });
        it('Tokenizes', async function () {
            const child = await tokenizeAndValidate('$if[$or[a,b], true, false]', IfToken);

            const cond = child.value;
            await expectInstance(cond, LogicToken);
            await expectEqual(cond.value, 'or');
            await expectInstance(cond.arguments, ArgumentsToken);

            const args = cond.arguments.value;
            await expectEqual(args.length, 2);
            await expectInstance(args[0], ComparisonToken);
            await expectEqual(args[0].value, 'istruthy');
            await expectInstance(args[0].left, TextToken);
            await expectEqual(args[0].left.value, 'a');
            await expectEqual(args[0].right, undefined);
            await expectInstance(args[1], ComparisonToken);
            await expectEqual(args[1].value, 'istruthy');
            await expectInstance(args[1].left, TextToken);
            await expectEqual(args[1].left.value, 'b');
            await expectEqual(args[1].right, undefined);

            const whenTrue = child.whenTrue;
            await expectInstance(whenTrue, TextToken);
            await expectEqual(whenTrue.value, 'true');

            const whenFalse = child.whenFalse;
            await expectInstance(whenFalse, TextToken);
            await expectEqual(whenFalse.value, 'false');
        });
        it('Evaluates', async function () {
            let result = await tokenize({ variables, expression: '$if[ $or[ $true ], true, false]'}).evaluate();
            await expectEqual(result, 'true');

            result = await tokenize({ variables, expression: '$if[ $or[ $false ], true, false]'}).evaluate();
            await expectEqual(result, 'false');

            result = await tokenize({ variables, expression: '$if[ $or[ $false, $false ], true, false]'}).evaluate();
            await expectEqual(result, 'false');

            result = await tokenize({ variables, expression: '$if[ $or[ $true, $true ], true, false]'}).evaluate();
            await expectEqual(result, 'true');

            result = await tokenize({ variables, expression: '$if[ $or[ $true, $false ], true, false]'}).evaluate();
            await expectEqual(result, 'true');

            result = await tokenize({ variables, expression: '$if[ $or[ $false, $true, $false ], true, false]'}).evaluate();
            await expectEqual(result, 'true');
        });
    });

    describe('Logical Operator: $not', async function () {
        it('Throws an error when used without an arguments-bloc', async function () {
            await expectThrow(async () => {
                tokenize({ variables, lookups, expression: '$if[$not]'});
            }, ExpressionSyntaxError);
        });
        it('Throws an error when used with an empty arguments-bloc', async function () {
            await expectThrow(async () => {
                tokenize({ variables, lookups, expression: '$if[$not[]]'});
            }, ExpressionArgumentsError);
        });
        it('Throws an error when used with more than 1 argument', async function () {
            await expectThrow(async () => {
                tokenize({ variables, lookups, expression: '$if[$not[1,2]]'});
            }, ExpressionArgumentsError);
        });
        it('Tokenizes', async function () {
            const child = await tokenizeAndValidate('$if[$not[a], true, false]', IfToken);

            const cond = child.value;
            await expectInstance(cond, LogicToken);
            await expectEqual(cond.value, 'not');
            await expectInstance(cond.arguments, ArgumentsToken);

            const args = cond.arguments.value;
            await expectEqual(args.length, 1);
            await expectInstance(args[0], ComparisonToken);
            await expectEqual(args[0].value, 'istruthy');
            await expectInstance(args[0].left, TextToken);
            await expectEqual(args[0].left.value, 'a');
            await expectEqual(args[0].right, undefined);

            const whenTrue = child.whenTrue;
            await expectInstance(whenTrue, TextToken);
            await expectEqual(whenTrue.value, 'true');

            const whenFalse = child.whenFalse;
            await expectInstance(whenFalse, TextToken);
            await expectEqual(whenFalse.value, 'false');
        });
        it('Evaluates', async function () {
            let result = await tokenize({ variables, expression: '$if[ $not[ $true ], true, false]'}).evaluate();
            await expectEqual(result, 'false');

            result = await tokenize({ variables, expression: '$if[ $not[ $false ], true, false]'}).evaluate();
            await expectEqual(result, 'true');
        })
    });
});

describe('Expression is a block escape', async function () {
    it('Treats opener double back ticks without closing back ticks as literal text', async function () {
        const result = await tokenize({ variables, expression: '``abc'}).evaluate();
        expectEqual(result, '``abc');
    });

    it("Ignores special characters", async function () {
        let result = await tokenize({ variables, expression: '``"``'}).evaluate();
        expectEqual(result, '"');

        result = await tokenize({ variables, expression: '``\\"``'}).evaluate();
        expectEqual(result, '\\"');
    });

    describe('Empty', async function () {
        const expression = '````';
        it('Does not throw an error', async function () {
            tokenize({ variables, expression });
        });
        it('Tokenizes', async function () {
            const result = await tokenizeAndValidate(expression, SequenceToken);
            await expectEqual(result.value.length, 0);
        });
        it('Evaluates', async function () {
            const result = await tokenize({ variables, expression }).evaluate();
            await expectEqual(result, undefined);
        })
    });

    describe('Plain Text', async function () {
        const expression = '``text``';
        it('Does not throw an error', async function () {
            tokenize({ variables, expression });
        });
        it('Tokenizes', async function () {
            await tokenizeAndValidate(expression, TextToken, 'text');
        });
        it('Evaluates', async function () {
            const result = await tokenize({ variables, expression }).evaluate();
            await expectEqual(result, 'text');
        })
    });

    describe('Variable', async function () {
        const expression = '``$text``';
        it('Does not throw an error', async function () {
            tokenize({ variables, expression });
        });
        it('Tokenizes', async function () {
            await tokenizeAndValidate(expression, VariableToken, 'text');
        });
        it('Evaluates', async function () {
            const result = await tokenize({ variables, expression }).evaluate();
            await expectEqual(result, 'text_value');
        });
    });

    describe('Lookup', async function () {
        const expression = '``$&text``';
        it('Does not throw an error', async function () {
            tokenize({ variables, lookups, expression });
        });
        it('Tokenizes', async function () {
            await tokenizeAndValidate(expression, LookupToken, 'text');
        });
        it('Evaluates', async function () {
            const result = await tokenize({ variables, lookups, expression }).evaluate();
            await expectEqual(result, 'text_value');
        });
    });

    describe('Mixed inputs', async function () {
        const expression = '``start $text $&text end``';
        it('Does not throw an error', function () {
            tokenize({variables, lookups, expression });
        });
        it('Tokenizes', async function () {
            const result = await tokenizeAndValidate(expression, SequenceToken);
            await expectEqual(result.value.length, 5);
        });
        it('Evaluates', async function () {
            const result = await tokenize({ variables, lookups, expression}).evaluate();
            expectEqual(result, 'start text_value text_value end');
        })
    });
});

/*TODO:
- validate mixes expressions
- check that tokenize({ LogicalOperators }) are accessible during tokenize/evaluate
- check that tokenize({ ComparisonOperators }) are accessible during tokenize/evaluate
*/