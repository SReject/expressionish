import type ITokenizeState from '../../../types/tokenize-state';

import type Token from '../../token';
import TextToken from '../token';

import tokenizeSpecial from './special';

const tokenBase : ITokenizeState = {
    options: {},
    tokens: [],
    cursor: 0,
    stack: []
};

test('It exports a function', () => {
    expect(typeof tokenizeSpecial).toBe('function');
});

test('Returns false when options.specialSequences is false', async () => {
    expect.assertions(1);
    const result = await tokenizeSpecial({
        ...tokenBase,
        options: { specialSequences: false }
    });
    expect(result).toBe(false);
});

test('Returns false when theres no tokens', async () => {
    expect.assertions(1);
    const result = await tokenizeSpecial(tokenBase);
    expect(result).toBe(false);
});

test('Returns false when theres only one token', async () => {
    expect.assertions(1);
    const result = await tokenizeSpecial({
        ...tokenBase,
        tokens: [{position: 0, value: ''}]
    });
    expect(result).toBe(false);
});

test('Returns false when there\'s only one token left', async () => {
    expect.assertions(1);
    const result = await tokenizeSpecial({
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
    const result = await tokenizeSpecial({
        ...tokenBase,
        tokens: [
            {position: 0, value: 'a'},
            {position: 0, value: 'n'}
        ],
        cursor: 0
    });
    expect(result).toBe(false);
});

test('Returns false when there isn\'t a special sequence', async () => {
    expect.assertions(1);
    const result = await tokenizeSpecial({
        ...tokenBase,
        tokens: [
            {position: 0, value: '\\'},
            {position: 0, value: 'v'}
        ],
        cursor: 0
    });
    expect(result).toBe(false);
});

test('Parses \\n', async () => {
    expect.assertions(4);

    const state : ITokenizeState = {
        ...tokenBase,
        tokens: [
            {position: 0, value: '\\'},
            {position: 1, value: 'n'}
        ]
    };
    const result = await tokenizeSpecial(state);

    expect(result).toBe(true);
    expect(state.output).toBeDefined();
    expect(state.output instanceof TextToken).toBe(true);
    expect((<Token>state.output).value).toBe('\n');
});

test('Parses \\r', async () => {
    expect.assertions(4);

    const state : ITokenizeState = {
        ...tokenBase,
        tokens: [
            {position: 0, value: '\\'},
            {position: 1, value: 'r'}
        ]
    };
    const result = await tokenizeSpecial(state);

    expect(result).toBe(true);
    expect(state.output).toBeDefined();
    expect(state.output instanceof TextToken).toBe(true);
    expect((<Token>state.output).value).toBe('\r');
});

test('Parses \\t', async () => {
    expect.assertions(4);

    const state : ITokenizeState = {
        ...tokenBase,
        tokens: [
            {position: 0, value: '\\'},
            {position: 1, value: 't'}
        ]
    };
    const result = await tokenizeSpecial(state);

    expect(result).toBe(true);
    expect(state.output).toBeDefined();
    expect(state.output instanceof TextToken).toBe(true);
    expect((<Token>state.output).value).toBe('\t');
});