import has from './has';

test('Should return false for nullish values', () => {
    // @ts-expect-error: Testing no value
    expect(has()).toBe(false);

    // @ts-expect-error: Testing undefined value
    expect(has(undefined)).toBe(false);

    // @ts-expect-error: Testing null value
    expect(has(null)).toBe(false);
});

test('It should return false for prototype members', () => {
    expect(has([], 'split')).toBe(false);
});

test('It should return true for own members', () => {
    expect(has({key: 'value'}, 'key')).toBe(true);
});