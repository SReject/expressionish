import '../../../../../../../jest/helpers';

import operator from './index';

test('Exports an operator definition', () => {
    expect(operator).toBeAnOperator();
});

test('Returns true for strictly equal values', async () => {
    expect(await operator.handle({}, {}, { caseSensitive: false, left: false, right: false })).toBe(true);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: true,  right: true })).toBe(true);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: 1,     right: 1 })).toBe(true);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: null,  right: undefined })).toBe(true);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: NaN,   right: NaN })).toBe(true);

    const value = {};
    expect(await operator.handle({}, {}, { caseSensitive: false, left: value, right: value})).toBe(true);
});

test('Returns false when in-equal', async () => {
    expect(await operator.handle({}, {}, { caseSensitive: false, left: true, right: false })).toBe(false);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: null, right: 'null' })).toBe(false);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: null, right: '' })).toBe(false);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: 1,    right: '1' })).toBe(false);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: {},   right: {} })).toBe(false);
});