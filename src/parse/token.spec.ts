import '../../jest/helpers';

import TokenType from '../types/token-types';
import Token from './token';

test('Exports a constructor', () => {
    expect(typeof Token).toBe('function');
    expect(Token.prototype).toBeDefined();
});

test('Has .toJSON() function', () => {
    expect(Token.prototype).toHaveOwnProperty('toJSON');
    expect(typeof Token.prototype.toJSON).toBe('function');
});

test('Has .toString() function', () => {
    expect(Token.prototype).toHaveOwnProperty('toString');
    expect(typeof Token.prototype.toString).toBe('function');
});

test('Has .evaluate() function', () => {
    expect(Token.prototype).toHaveOwnProperty('evaluate');
    expect(typeof Token.prototype.evaluate).toBe('function');
});

test('Constructs without error', () => {
    expect(() => new Token()).not.toThrow();
});

test('Stores type correctly', () => {
    const result1 = new Token();
    expect(result1).toHaveOwnProperty('type', TokenType.UNKNOWN);

    const result2 = new Token({ type: TokenType.TEXT })
    expect(result2).toHaveOwnProperty('type', TokenType.TEXT);
});

test('Stores position correctly', () => {
    const result1 = new Token();
    expect(result1).toHaveOwnProperty('position', -1);

    const result2 = new Token({ position: 10 })
    expect(result2).toHaveOwnProperty('position', 10);
});

test('Stores value correctly', () => {
    const result1 = new Token();
    expect(result1.value).toBeUndefined()

    const result2 = new Token({ value: 'test' })
    expect(result2).toHaveOwnProperty('value', 'test');
});

test('.toJSON() returns proper representation', () => {
    const result1 = (new Token()).toJSON();
    expect(result1).toHaveOwnProperty('type', TokenType.UNKNOWN);
    expect(result1).toHaveOwnProperty('position', -1);
    expect(result1).toHaveOwnProperty('value', null);

    const result2 = (new Token({ type: TokenType.TEXT, position: 0, value: 'test' })).toJSON();
    expect(result2).toHaveOwnProperty('type', TokenType.TEXT);
    expect(result2).toHaveOwnProperty('position', 0);
    expect(result2).toHaveOwnProperty('value', 'test');
});

test('.toString() returns proper representation', () => {
    const json = (new Token({ type: TokenType.TEXT, position: 0, value: 'test' })).toString();
    const result = JSON.parse(json);

    expect(result).toHaveOwnProperty('type', TokenType.TEXT);
    expect(result).toHaveOwnProperty('position', 0);
    expect(result).toHaveOwnProperty('value', 'test');
});

test('.evaluate() throws unless token is empty', () => {
    expect(() => {
        const token = new Token();
        return token.evaluate({}, {})
    }).toAsyncThrow();
});

test('.evaluate() does not throw if token is empty', () => {
    expect(() => {
        const token = new Token({type: TokenType.EMPTY});
        return token.evaluate({}, {});
    }).not.toAsyncThrow();
});

test('.evaluate() returns undefined for empty token', async () => {
    expect.assertions(1);
    const token = new Token({type: TokenType.EMPTY});
    const result = await token.evaluate({}, {});
    expect(result).toBeUndefined();
});