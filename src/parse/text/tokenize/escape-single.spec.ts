import type ITokenizeState from '../../../types/tokenize-state';

import type Token from '../../token';
import TextToken from '../token';
import tokenizeEscape from './escape-single';

const tokenBase : ITokenizeState = {
    options: {},
    stack: [],
    tokens: [],
    cursor: 0
};

test('Exports a function', () => {
    expect(typeof tokenizeEscape).toBe('function');
});

test('Returns false when theres no tokens', async () => {
    expect.assertions(1);
    const result = await tokenizeEscape(tokenBase);
    expect(result).toBe(false);
});

test('Returns false when theres only one token', async () => {
    expect.assertions(1);
    const result = await tokenizeEscape({
        ...tokenBase,
        tokens: [{position: 0, value: ''}]
    });
    expect(result).toBe(false);
});

test('Returns false when there\'s only one token left', async () => {
    expect.assertions(1);
    const result = await tokenizeEscape({
        ...tokenBase,
        tokens: [
            {position: 0, value: ''},
            {position: 0, value: ''}
        ],
        cursor: 1
    });
    expect(result).toBe(false);
});

test('Returns false when token at cursor is not \\', async () => {
    expect.assertions(1);
    const result = await tokenizeEscape({
        ...tokenBase,
        tokens: [
            {position: 0, value: 'a'},
            {position: 0, value: 'n'}
        ],
        cursor: 0
    });
    expect(result).toBe(false);
});

test('Returns false when token isn\'t an escapable sequence', async () => {
    expect.assertions(1);
    const result = await tokenizeEscape({
        ...tokenBase,
        tokens: [{position: 0, value: '\\'}, {position: 0, value: 'n'}],
        cursor: 0
    });
    expect(result).toBe(false);
});

test('Returns true for default: \\\\', async () => {
    expect.assertions(4);
    const state : ITokenizeState = {
        ...tokenBase,
        tokens: [{position: 0, value: '\\'}, {position: 0, value: '\\'}],
        cursor: 0
    };
    const result = await tokenizeEscape(state);
    expect(result).toBe(true);
    expect(state.output).toBeDefined();
    expect(state.output instanceof TextToken).toBe(true);
    expect((<Token>state.output).value).toBe('\\');
});

test('Returns true for default: \\$', async () => {
    expect.assertions(4);
    const state : ITokenizeState = {
        ...tokenBase,
        tokens: [{position: 0, value: '\\'}, {position: 0, value: '$'}],
        cursor: 0
    };
    const result = await tokenizeEscape(state);
    expect(result).toBe(true);
    expect(state.output).toBeDefined();
    expect(state.output instanceof TextToken).toBe(true);
    expect((<Token>state.output).value).toBe('$');
});

test('Returns true for default: \\"', async () => {
    expect.assertions(4);
    const state : ITokenizeState = {
        ...tokenBase,
        tokens: [{position: 0, value: '\\'}, {position: 0, value: '"'}],
        cursor: 0
    };
    const result = await tokenizeEscape(state);
    expect(result).toBe(true);
    expect(state.output).toBeDefined();
    expect(state.output instanceof TextToken).toBe(true);
    expect((<Token>state.output).value).toBe('"');
});

test('Returns true for default: \\`', async () => {
    expect.assertions(4);
    const state : ITokenizeState = {
        ...tokenBase,
        tokens: [{position: 0, value: '\\'}, {position: 0, value: '`'}],
        cursor: 0
    };
    const result = await tokenizeEscape(state);
    expect(result).toBe(true);
    expect(state.output).toBeDefined();
    expect(state.output instanceof TextToken).toBe(true);
    expect((<Token>state.output).value).toBe('`');
});

test('Returns false for defaults when alternative list is specified', async () => {
    expect.assertions(1);
    const state : ITokenizeState = {
        ...tokenBase,
        tokens: [{position: 0, value: '\\'}, {position: 0, value: '$'}],
        cursor: 0
    };
    const result = await tokenizeEscape(state, ['@']);
    expect(result).toBe(false);
});

test('Uses alternative list of escapables when specified', async () => {
    expect.assertions(4);
    const state : ITokenizeState = {
        ...tokenBase,
        tokens: [{position: 0, value: '\\'}, {position: 0, value: '@'}],
        cursor: 0
    };
    const result = await tokenizeEscape(state, ['@']);
    expect(result).toBe(true);
    expect(state.output).toBeDefined();
    expect(state.output instanceof TextToken).toBe(true);
    expect((<Token>state.output).value).toBe('@');
});