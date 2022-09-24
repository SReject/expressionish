import '../../jest/helpers';

import TokenType from '../types/token-types';
import IParseOptions from '../types/options';

import Token from './token';
import TokenList from './token-list';

test('Exports a constructor', () => {
    expect(typeof TokenList).toBe('function');
    expect(TokenList.prototype).toBeDefined();
});

test('Has .toJSON() function', () => {
    expect(TokenList.prototype).toHaveOwnProperty('toJSON');
    expect(typeof TokenList.prototype.toJSON).toBe('function');
});

test('Has .evaluate() function', () => {
    expect(TokenList.prototype).toHaveOwnProperty('evaluate');
    expect(typeof TokenList.prototype.evaluate).toBe('function');
});

test('Constructor errors when token is nullish', () => {
    expect(() => {
        // @ts-expect-error: Testing nullish token
        new TokenList();
    }).toThrow();
});

test('Constructor errors when token is not an object', () => {
    expect(() => {
        // @ts-expect-error: Testing invalid token
        new TokenList(true);
    }).toThrow();
});

test('Constructor errors when token.value is nullish', () => {
    expect(() => {
        // @ts-expect-error: Testing nullish token.value
        new TokenList({});
    }).toThrow();
});

test('Constructor errors when token.value is not an array', () => {
    expect(() => {
        // @ts-expect-error: Testing invalid token.value
        new TokenList({value: ''});
    }).toThrow();
});

test('Constructor errors when token.value contains a non-token instance', () => {
    expect(() => {
        // @ts-expect-error: Testing invalid token.value
        new TokenList({value: ['']});
    }).toThrow();
});

test('Constructs without error', () => {
    expect(() => new TokenList({value: []})).not.toThrow();
});

test('Instance to be instance of TokenList and Token', () => {
    const token = new TokenList({value: []});
    expect(token).toBeInstanceOf(TokenList);
    expect(token).toBeInstanceOf(Token);
});

test('.type is set to TOKENLIST', () => {
    const token = new TokenList({value: []});
    expect(token).toHaveOwnProperty('type', TokenType.TOKENLIST);
});

test('.value is set to input', () => {
    const value : Token[] = [];
    const token = new TokenList({ value });
    expect(token).toHaveOwnProperty('value', value);
});

test('.toJSON() calls super.toJSON()', () => {
    const spy = jest.spyOn(Token.prototype, 'toJSON');
    const token = new TokenList({ value: [] });
    expect(() => token.toJSON()).not.toThrow();
    expect(spy).toHaveBeenCalledTimes(1);
    jest.clearAllMocks();
});

test('.toJSON() returns valid representation', () => {
    const value = new Token();
    let calls = 0;
    value.toJSON = function(this: Token) : Record<string, unknown> {
        calls += 1;
        return Token.prototype.toJSON.call(this);
    };

    const token = new TokenList({value: [value]});
    const json = token.toJSON();
    expect(calls).toBe(1);

    expect(json).toHaveOwnProperty('value');
    expect(Array.isArray(json.value)).toBeTruthy();
    expect((<Token[]>json.value).length).toBe(1);
});

test('.evaluate() calls evaluate for values/falls back to defaults for inputs', async () => {
    const value = new Token();

    let receivedOptions : void | IParseOptions = undefined;
    let receivedMeta : void | unknown = undefined;
    value.evaluate = async function(options: IParseOptions, meta: unknown) : Promise<unknown> {
        receivedOptions = options;
        receivedMeta = meta;
        return;
    };
    const token = new TokenList({value: [value]});

    // @ts-expect-error : Testing nulled inputs
    await token.evaluate();
    expect(receivedOptions).toBeDefined();
    expect(receivedMeta).toBeDefined();
});

test('.evaluate() returns undefined when options.verifyOnly is specified', async () => {
    const value = new Token();
    value.evaluate = async function() : Promise<unknown> {
        return 'text';
    }
    const token = new TokenList({value: [value]});

    const result = await token.evaluate({verifyOnly: true}, {});
    expect(result).toBeUndefined();
});

test('.evaluate() sets result to value when result is not set', async () => {
    const value = new Token();
    value.evaluate = async function() : Promise<unknown> {
        return 'test';
    }
    const token = new TokenList({value: [value]});

    const result = await token.evaluate({}, {});
    expect(result).toBe('test');
});

test('.evaluate() returns null if only a single value is given and its null', async () => {
    const value = new Token();
    value.evaluate = async function() : Promise<unknown> {
        return null;
    }
    const token = new TokenList({value: [value]});

    const result = await token.evaluate({}, {});
    expect(result).toBeNull();
});

test('.evaluate() does not append non-textable values', async () => {
    const value1 = new Token();
    value1.evaluate = async function() : Promise<unknown> { return 'a'; }

    const value2 = new Token();
    value2.evaluate = async function() : Promise<unknown> { return; }

    const value3 = new Token();
    value3.evaluate = async function() : Promise<unknown> { return null; }

    const value4 = new Token();
    value4.evaluate = async function() : Promise<unknown> { return 'b'; }

    const token = new TokenList({value: [value1, value2, value3, value4]});

    const result = await token.evaluate({}, {});
    expect(result).toBe('ab');
});

test('.evaluate() converts to text when appending', async () => {
    const value1 = new Token();
    value1.evaluate = async function() : Promise<unknown> { return {}; }

    const value2 = new Token();
    value2.evaluate = async function() : Promise<unknown> { return 'a'; }

    const token = new TokenList({value: [value1, value2]});

    const result = await token.evaluate({}, {});
    expect(result).toBe('{}a');
});

test('.evaluate() ignores functions', async () => {
    const value1 = new Token();
    value1.evaluate = async function() : Promise<unknown> { return (()=>1); }

    const value2 = new Token();
    value2.evaluate = async function() : Promise<unknown> { return 'a'; }

    const token = new TokenList({value: [value1, value2]});

    const result = await token.evaluate({}, {});
    expect(result).toBe('a');
});