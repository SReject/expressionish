import {
    is,
    consume
} from './whitespace';

test('Export \'is\' as a function', () => {
    expect(typeof is).toBe('function');
});

test('is() returns undefined if token is not whitespace', () => {
    expect(is([], 0)).toBe(false)
    expect(is([{position: 0, value: ''}], 0)).toBe(false);
});

test('is() returns true for whitespace tokens', () => {
    expect(is([{position: 0, value: ' '}], 0)).toBe(true);
    expect(is([{position: 0, value: '\t'}], 0)).toBe(true);
    expect(is([{position: 0, value: '\n'}], 0)).toBe(true);
    expect(is([{position: 0, value: '\t'}], 0)).toBe(true);
});

test('Export \'consume\' as a function', () => {
    expect(typeof consume).toBe('function');
});

test('consume() does not progress cursor for non whitespace', () => {
    expect(consume([
        {position: 0, value: 'a'}
    ],0)).toBe(0);
});

test('consume() progresses beyond whitespace', () => {
    expect(consume([
        {position: 0, value: ' '},
        {position: 1, value: '\t'},
        {position: 2, value: '\n'},
        {position: 3, value: '\r'},
        {position: 4, value: 'a'}
    ],0)).toBe(4);
});