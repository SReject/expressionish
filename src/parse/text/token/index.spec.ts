import '../../../../jest/helpers';

import Token from '../../token';
import TextToken from './index';

test('Exports a function', () => {
    expect(typeof TextToken).toBe('function');
    expect(TextToken.prototype).toBeDefined();
});

test('Throws an error if specified input is not string', () => {
    expect(() => new TextToken({
        // @ts-expect-error: Testing non-string values
        value: false
    })).toThrow();
});

test('Constructs when inputs are valid', () => {
    expect(() => new TextToken()).not.toThrow();
});

test('Instances derive from Token', () => {
    expect(new TextToken()).toBeInstanceOf(Token);
});

test('Defaults value to empty string', () => {
    expect(new TextToken()).toHaveOwnProperty('value', '');
});

test('Stores value properly', () => {
    expect(new TextToken({value: 'test'})).toHaveOwnProperty('value', 'test');
});

test('Evaluates to value property', async () => {
    expect.assertions(2);

    const result = await (new TextToken()).evaluate({}, {});
    expect(result).toBe('');

    const result2 = await (new TextToken({value: 'test'})).evaluate({}, {});
    expect(result2).toBe('test');
});