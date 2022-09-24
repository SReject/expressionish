import toNumber from './to-number';

test('Returns null for non-numerics', () => {
    //@ts-expect-error: Testing empty input
    expect(toNumber()).toBe(null);
    expect(toNumber(undefined)).toBe(null);
    expect(toNumber(null)).toBe(null);
    expect(toNumber('')).toBe(null);
    expect(toNumber([])).toBe(null);
    expect(toNumber({})).toBe(null);
    expect(toNumber(()=>1)).toBe(null);
    expect(toNumber(NaN)).toBe(null);
    expect(toNumber(Infinity)).toBe(null);
});

test('Returns number for numeric', () => {
    expect(toNumber(1)).toBe(1);
    expect(toNumber('1')).toBe(1);
})