import {
    TextToken,
    tokenizeEscape,
    tokenizeEscapeBlock,
    tokenizeQuoted,
    tokenizeSpecial
} from './index';

test('Exports TextToken constructor', () => {
    expect(typeof TextToken).toBe('function');
    expect(TextToken).toBeInstanceOf(Function);
    expect(TextToken.prototype).toBeDefined();
});

test('Exports tokenizeEscape function', () => {
    expect(typeof tokenizeEscape).toBe('function');
    expect(tokenizeEscape).toBeInstanceOf(Function);
    expect(tokenizeEscape.prototype).toBeUndefined();
});

test('Exports tokenizeEscapeBlock function', () => {
    expect(typeof tokenizeEscapeBlock).toBe('function');
    expect(tokenizeEscapeBlock).toBeInstanceOf(Function);
    expect(tokenizeEscapeBlock.prototype).toBeUndefined();
});

test('Exports tokenizeQuoted function', () => {
    expect(typeof tokenizeQuoted).toBe('function');
    expect(tokenizeQuoted).toBeInstanceOf(Function);
    expect(tokenizeQuoted.prototype).toBeUndefined();
});

test('Exports tokenizeSpecial function', () => {
    expect(typeof tokenizeSpecial).toBe('function');
    expect(tokenizeSpecial).toBeInstanceOf(Function);
    expect(tokenizeSpecial.prototype).toBeUndefined();
});