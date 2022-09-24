import isPrimitive from './is-primitive';

test('Returns true for boolean', () => {
    expect(isPrimitive(true)).toBe(true);
    expect(isPrimitive(false)).toBe(true);
});

test('Returns true for finite numbers, and false for other numbers', () => {
    expect(isPrimitive(1)).toBe(true);
    expect(isPrimitive(NaN)).toBe(false);
    expect(isPrimitive(Infinity)).toBe(false);
});

test('Returns true for literal strings, false for instances', () => {
    expect(isPrimitive('')).toBe(true);
    expect(isPrimitive(new String(''))).toBe(false);
});

test('All others should be false', () => {
    // @ts-expect-error: Testing empty input
    expect(isPrimitive()).toBe(false);
    expect(isPrimitive(undefined)).toBe(false);
    expect(isPrimitive(null)).toBe(false);
    expect(isPrimitive([])).toBe(false);
    expect(isPrimitive({})).toBe(false);
    expect(isPrimitive(()=>1)).toBe(false);
});
