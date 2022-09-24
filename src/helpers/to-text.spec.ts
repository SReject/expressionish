import toText from './to-text';

test('Nullish values return undefined', () => {
    // @ts-expect-error: Testing no input
    expect(toText()).toBeUndefined();
    expect(toText(undefined)).toBeUndefined();
    expect(toText(null)).toBeUndefined();
    expect(toText(()=>1)).toBeUndefined();
});

test('Primitive values should get converted to simple text', () => {
    expect(toText(true)).toBe('true');
    expect(toText(false)).toBe('false');
    expect(toText(10)).toBe('10');
    expect(toText('text')).toBe('text');
});

test('Object should be converted to json', () => {
    expect(toText({})).toBe('{}');
});