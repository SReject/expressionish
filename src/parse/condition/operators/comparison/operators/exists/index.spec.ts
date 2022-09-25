import '../../../../../../../jest/helpers';

import operator from './index';

test('Exports an operator definition', () => {
    expect(operator).toBeAnOperator();
});

test('Returns truthy when value is not falsey', async () => {
    expect(await operator.handle({}, {}, { caseSensitive: false, left: undefined })).toBe(false);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: null })).toBe(false);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: false })).toBe(false);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: '' })).toBe(false);
    expect(await operator.handle({}, {}, { caseSensitive: false, left: 'test' })).toBe(true);
});