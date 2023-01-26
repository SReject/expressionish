const wildcardToRegExp = require('../helpers/wildcard-to-regexp.js');

const isRange = /^((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+))-((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+))$/;

const toNumber = (v1, v2) => {
    if (v1 === '' || v2 === '') {
        return [v1, v2];
    }

    const v1Num = Number(v1);
    if (Number.isNaN(v1Num)) {
        return [v1, v2];
    }

    const v2Num = Number(v2);
    if (Number.isNaN(v2Num)) {
        return [v1, v2];
    }
    return [v1Num, v2Num];
}

const isStrictEqual = (v1, v2) => {
    return v1 === v2;
};

const isLooseEqual = (v1, v2) => {
    if (v1 === v2) {
        return true;
    }
    if (('' + v1).toLowerCase() === ('' + v2).toLowerCase()) {
        return true;
    }
    const [v1Num, v2Num] = toNumber(v1, v2);
    return v1Num === v2Num;
};

const exists = (v1) => {
    return v1 != null &&
        v1 !== false &&
        v1 !== '';
};

const isNumber = (v1, v2) => {
    if (v1 === '') {
        return false;
    }
    v1 = Number(v1);

    if (Number.isNaN(v1)) {
        return false;
    }
    if (v2 == null || v2 === '') {
        return true;
    }
    const range = isRange.exec(v2);

    if (!range) {
        return false;
    }

    let r1 = Number(range[1]),
        r2 = Number(range[2]);

    if (r1 > r2) {
        return (r2 <= v1 && v1 <= r1);
    }
    return (r1 <= v1 && v1 <= r2);
};

const isRegexMatch = (v1, v2) => {
    const parts = /^\/(.*)\/([a-z]*)$/i.exec(v2);
    if (parts) {
        return (new RegExp(parts[1], parts[2])).test(v1);
    }
    return (new RegExp(v2)).test(v1);
};

const isWildcardMatch = (v1, v2) => {
    if (v2 === null || v2 == '') {
        return false;
    }
    return wildcardToRegExp(v2, false).test(v1);
}

const isWildcardMatchCaseSensitive = (v1, v2) => {
    if (v2 === null || v2 == '') {
        return false;
    }
    return wildcardToRegExp(v2, true).test(v1);
};

module.exports = new Map([
    ['===', isStrictEqual],
    ['!==', (...args) => !(isStrictEqual(...args))],

    ['==', isLooseEqual],
    ['!=', (...args) => !(isLooseEqual(...args))],

    ['<', (v1, v2) => {
        [v1, v2] = toNumber(v1, v2);
        if (typeof v1 !== 'number' || typeof v2 !== 'number') {
            return false;
        }
        return v1 < v2;
    }],
    ['<=', (v1, v2) => {
        [v1, v2] = toNumber(v1, v2);
        if (typeof v1 !== 'number' || typeof v2 !== 'number') {
            return false;
        }
        return v1 <= v2;
    }],
    ['>', (v1, v2) => {
        [v1, v2] = toNumber(v1, v2);
        if (typeof v1 !== 'number' || typeof v2 !== 'number') {
            return false;
        }
        return v1 > v2;
    }],
    ['>=', (v1, v2) => {
        [v1, v2] = toNumber(v1, v2);
        if (typeof v1 !== 'number' || typeof v2 !== 'number') {
            return false;
        }
        return v1 >= v2;
    }],

    ['exists',  exists],
    ['!exists', (...args) => !(exists(...args))],

    ['isnumber',  isNumber],
    ['isnum', isNumber],

    ['!isnumber', (...args) => !(isNumber(...args))],
    ['!isnum', (...args) => !(isNumber(...args))],

    ['regex', isRegexMatch],
    ['!regex', (...args) => !(isRegexMatch(...args))],

    ['iswcm',  isWildcardMatch],
    ['!iswcm', (...args) => !(isWildcardMatch(...args))],

    ['iswcmcs',  isWildcardMatchCaseSensitive],
    ['!iswcmcs', (...args) => !(isWildcardMatchCaseSensitive(...args))]
]);