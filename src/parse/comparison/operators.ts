import wildcardToRegExp from '../../misc/wildcard';

/** Attempts to convert the two inputs into numeric values */
const toNumber = (v1: unknown, v2: unknown) : [unknown, unknown]|[number, number]=> {
    if (v1 === '' || v2 === '') {
        return [v1, v2];
    }

    const v1Num = Number(v1);
    if (!Number.isFinite(v1Num)) {
        return [v1, v2];
    }

    const v2Num = Number(v2);
    if (!Number.isFinite(v2Num)) {
        return [v1, v2];
    }
    return [v1Num, v2Num];
}

/** Tests if inputs are strictly equal */
const isStrictEqual = (v1: unknown, v2: unknown) => {
    return v1 === v2;
};

/** Tests if inputs are loosely equal */
const isLooseEqual = (v1: unknown, v2: unknown) => {
    if (v1 === v2) {
        return true;
    }
    if (('' + v1).toLowerCase() === ('' + v2).toLowerCase()) {
        return true;
    }
    const [v1Num, v2Num] = toNumber(v1, v2);
    return v1Num === v2Num;
};

/** Tests if input is not a nullish value */
const exists = (v1: unknown) => {
    return v1 != null &&
        v1 !== false &&
        v1 !== '';
};

const isRange = /^((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+))-((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+))$/;

/** Tests if `v1` is numeric and, if `v2` is specified, within the range of `v2` */
const isNumber = (v1: unknown, v2?: unknown) => {
    if (v1 === '') {
        return false;
    }
    v1 = Number(v1);

    if (!Number.isFinite(v1)) {
        return false;
    }
    if (v2 == null || v2 === '') {
        return true;
    }
    const range = isRange.exec(v2 as string);

    if (!range) {
        return false;
    }

    const r1 = Number(range[1]),
        r2 = Number(range[2]);

    if (r1 > r2) {
        return (r2 <= (v1 as number) && (v1 as number) <= r1);
    }
    return (r1 <= (v1 as number) && (v1 as number) <= r2);
};

/** Tests if `v1` matches the regexp pattern of `v2` */
const isRegexMatch = (v1: unknown, v2: unknown) : boolean => {
    const parts = /^\/(.*)\/([a-z]*)$/i.exec(v2 as string);
    if (parts) {
        return (new RegExp(parts[1], parts[2])).test(v1 as string);
    }
    return (new RegExp(v2 as string)).test(v1 as string);
};

/** Tests if `v1` matches the wildcard pattern of `v2` */
const isWildcardMatch = (v1: unknown, v2?: unknown) : boolean => {
    if (v2 == null || v2 === '') {
        return false;
    }
    return wildcardToRegExp(v2 as string, false).test(v1 as string);
}

/** Tests if `v1` matches the wildcard pattern of `v2` (case-sensitive) */
const isWildcardMatchCaseSensitive = (v1: unknown, v2?: unknown) => {
    if (v2 == null || v2 === '') {
        return false;
    }
    return wildcardToRegExp(v2 as string, true).test(v1 as string);
};

/** Comparison Operator Map */
export default (new Map<string, (...args: unknown[]) => boolean>([
    ['==', isLooseEqual],
    ['!=', (v1: unknown, v2: unknown) => !isLooseEqual(v1, v2)],

    ['===', isStrictEqual],
    ['!==', (v1: unknown, v2: unknown) => !isStrictEqual(v1, v2)],

    ['<', (v1: unknown, v2: unknown) => {
        [v1, v2] = toNumber(v1, v2);
        if (typeof v1 !== 'number' || typeof v2 !== 'number') {
            return false;
        }
        return v1 < v2;
    }],
    ['<=', (v1: unknown, v2: unknown) => {
        [v1, v2] = toNumber(v1, v2);
        if (typeof v1 !== 'number' || typeof v2 !== 'number') {
            return false;
        }
        return v1 <= v2;
    }],

    ['>', (v1: unknown, v2: unknown) => {
        [v1, v2] = toNumber(v1, v2);
        if (typeof v1 !== 'number' || typeof v2 !== 'number') {
            return false;
        }
        return v1 > v2;
    }],
    ['>=', (v1: unknown, v2: unknown) => {
        [v1, v2] = toNumber(v1, v2);
        if (typeof v1 !== 'number' || typeof v2 !== 'number') {
            return false;
        }
        return v1 >= v2;
    }],

    ['exists',  exists],
    ['!exists', (v1: unknown) => !exists(v1)],

    ['isnumber',  isNumber],
    ['isnum', isNumber],
    ['!isnumber', (v1: unknown, range?: unknown) => !isNumber(v1, range)],
    ['!isnum', (v1: unknown, range?: unknown) => !isNumber(v1, range)],

    ['regex', isRegexMatch],
    ['!regex', (v1: unknown, v2: unknown) => !isRegexMatch(v1 as string, v2 as string)],

    ['iswcm',  isWildcardMatch],
    ['!iswcm', (v1: unknown, v2?: unknown) => !isWildcardMatch(v1, v2)],

    ['iswcmcs',  isWildcardMatchCaseSensitive],
    ['!iswcmcs', (v1: unknown, v2?: unknown) => !isWildcardMatchCaseSensitive(v1, v2)]
]));