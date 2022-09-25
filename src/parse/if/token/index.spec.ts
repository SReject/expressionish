import '../../../../jest/helpers';

import IfToken from './index';
import { ArgumentsQuantifier, OperatorToken } from '../../condition/';
import Token from '../../token';
import { TextToken } from '../../text';

test('Exports constructor', () => {
    expect(typeof IfToken).toBe('function');
    expect(IfToken.prototype).toBeDefined();
});

test('Has .toJSON() function', () => {
    expect(IfToken.prototype).toHaveOwnProperty('toJSON');
    expect(typeof IfToken.prototype.toJSON).toBe('function');
});

test('Has .evaluate function', () => {
    expect(IfToken.prototype).toHaveOwnProperty('evaluate');
    expect(typeof IfToken.prototype.evaluate).toBe('function');
});

test('Constructor throws when token is nullish', () => {
    expect(() => {
        // @ts-expect-error: Testing unspecified input
        new IfToken()
    }).toThrow();

    expect(() => {
        const input : void | null = undefined;
        // @ts-expect-error: Testing undefined input
        new IfToken(input);
    }).toThrow();

    expect(() => {
        const input : void | null = null;
        // @ts-expect-error: Testing null input
        new IfToken(input);
    }).toThrow();
});

test('Consturctot throw when token is not an object', () => {
    expect(() => {
        // @ts-expect-error: Testing invalid token input
        new IfToken('test')
    }).toThrow();
});

test('Constructor throws when condition is nullish', () => {
    expect(() => {
        // @ts-expect-error: Testing nullish condition input
        new IfToken({});
    }).toThrow();

    expect(() => {
        // @ts-expect-error: Testing nullish condition input
        new IfToken({condition: undefined});
    }).toThrow();

    expect(() => {
        // @ts-expect-error: Testing nullish condition input
        new IfToken({condition: null});
    }).toThrow();
});

test('Constructor throws when condition is not an OperatorToken instance', () => {
    expect(() => {
        // @ts-expect-error: Testing nullish condition input
        new IfToken({condition: 'text'});
    }).toThrow();
});

test('Constructor throws if whenTrue is nullish', () => {
    const op = new OperatorToken({
        quantifier: ArgumentsQuantifier.LEFTONLY,
        arguments: [new Token()],
        handle: async () => false
    });

    expect(() => {
        /*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/
        // @ts-ignore: Testing whenTrue value is not specified
        new IfToken({condition: op});
    }).toThrow();

    expect(() => {
        /*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/
        // @ts-ignore: Testing whenTrue value is undefined
        new IfToken({ condition: op, whenTrue: undefined });
    }).toThrow();

    expect(() => {
        /*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/
        // @ts-ignore: Testing whenTrue value null
        new IfToken({ condition: op, whenTrue: null });
    }).toThrow();
});

test('Constructor throws if whenTrue is not a token', () => {
    const op = new OperatorToken({
        quantifier: ArgumentsQuantifier.LEFTONLY,
        arguments: [new Token()],
        handle: async () => false
    });

    expect(() => {
        const input = { condition: op, whenTrue: '' };
        // @ts-expect-error: Testing whenTrue value is not a Token
        new IfToken(input);
    }).toThrow();
});

test('Constructor throws if whenFalse is specified but not a token', () => {
    const op = new OperatorToken({
        quantifier: ArgumentsQuantifier.LEFTONLY,
        arguments: [new Token()],
        handle: async () => false
    });

    expect(() => {
        // @ts-expect-error: Testing whenTrue value is not a Token
        new IfToken({ condition: op, whenTrue: new Token(), whenFalse: '' });
    }).toThrow();
});

test('Constructs without error', () => {
    const op = new OperatorToken({
        quantifier: ArgumentsQuantifier.LEFTONLY,
        arguments: [new Token()],
        handle: async () => false
    });
    expect(() => {
        new IfToken({
            condition: op,
            whenTrue: new Token()
        });
    }).not.toThrow();
});

test('.toJSON() calls super.toJSON', () => {
    const spy = jest.spyOn(Token.prototype, 'toJSON');
    const token = new IfToken({
        condition: new OperatorToken({
            quantifier: ArgumentsQuantifier.LEFTONLY,
            arguments: [new Token()],
            handle: async () => false
        }),
        whenTrue: new Token()
    });
    expect(() => token.toJSON()).not.toThrow();
    expect(spy).toHaveBeenCalled();
    jest.clearAllMocks();
});

test('.toJSON() returns proper representation', () => {
    expect.assertions(8);

    const toJSONResult = {};

    let condToJSONCalls = 0;
    const condition = new OperatorToken({
        quantifier: ArgumentsQuantifier.LEFTONLY,
        arguments: [new Token()],
        handle: async () => false
    });
    condition.toJSON = () : Record<string, unknown> => {
        condToJSONCalls += 1;
        return toJSONResult;
    };

    let whenTrueJSONCalls = 0;
    const whenTrue = new Token();
    whenTrue.toJSON = () : Record<string, unknown> => {
        whenTrueJSONCalls += 1;
        return toJSONResult;
    };

    let whenFalseJSONCalls = 0;
    const whenFalse = new Token();
    whenFalse.toJSON = () : Record<string, unknown> => {
        whenFalseJSONCalls += 1;
        return toJSONResult;
    };

    const token1 = new IfToken({
        condition,
        whenTrue
    });
    const result1 = token1.toJSON();
    expect(condToJSONCalls).toBe(1);
    expect(result1).toHaveOwnProperty('condition', toJSONResult);

    expect(whenTrueJSONCalls).toBe(1);
    expect(result1).toHaveOwnProperty('whenTrue', toJSONResult);

    expect(whenFalseJSONCalls).toBe(0);
    expect(result1.whenFalse).toBeUndefined();

    const token2 = new IfToken({
        condition,
        whenTrue,
        whenFalse
    });
    const result2 = token2.toJSON();
    expect(whenFalseJSONCalls).toBe(1);
    expect(result2).toHaveOwnProperty('whenFalse', toJSONResult);
});

test('.evaluate() calls evaluate for condition/falls back to defaults for inputs', async () => {
    let conditionCalled = 0,
        optionsSet = false,
        metaSet = false,
        whenTrueCalled = 0;

    const condition = new OperatorToken({
        position: 0,
        value: 'test',
        quantifier: ArgumentsQuantifier.LEFTONLY,
        defer: false,
        arguments: [new TextToken({value: 'text'})],
        handle: async function (options, meta) : Promise<boolean> {
            conditionCalled += 1;
            optionsSet = !!options;
            metaSet = !!meta;
            return true;
        }
    });

    const whenTrue = new Token();
    whenTrue.evaluate = async function () {
        whenTrueCalled += 1;
        return false;
    }

    const token = new IfToken({
        condition,
        whenTrue: whenTrue
    });

    expect.assertions(4);

    // @ts-expect-error : testing empty inputs
    await token.evaluate();

    expect(conditionCalled).toBe(1);
    expect(optionsSet).toBe(true);
    expect(metaSet).toBe(true);
    expect(whenTrueCalled).toBe(1);
});

test('.evaluate() evaluates all inputs when verifyOnly is true', async () => {
    const condition = new OperatorToken({
        position: 0,
        value: 'test',
        quantifier: ArgumentsQuantifier.LEFTONLY,
        defer: false,
        arguments: [new TextToken({value: 'text'})],
        handle: async function () : Promise<boolean> {
            return true;
        }
    });

    let whenCalls = 0;
    const when = new Token();
    when.evaluate = async function () {
        whenCalls += 1;
        return true;
    }

    const token = new IfToken({ condition, whenTrue: when, whenFalse: when });

    expect.assertions(2);
    const result = await token.evaluate({verifyOnly: true}, {});

    expect(result).toBeUndefined();
    expect(whenCalls).toBe(2);
});

test('.evaluate() evaluates false argument when condition is false and returns result', async () => {
    const condition = new OperatorToken({
        position: 0,
        value: 'test',
        quantifier: ArgumentsQuantifier.LEFTONLY,
        defer: false,
        arguments: [new TextToken({value: 'text'})],
        handle: async function () : Promise<boolean> {
            return false;
        }
    });

    let whenCalls = 0;
    const when = new Token();
    when.evaluate = async function () {
        whenCalls += 1;
        return 'falsey';
    }

    const token = new IfToken({ condition, whenTrue: new Token(), whenFalse: when });

    expect.assertions(2);
    const result = await token.evaluate({}, {});

    expect(result).toBe('falsey')
    expect(whenCalls).toBe(1);
});