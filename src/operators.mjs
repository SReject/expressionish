import wildcardToRegExp from './wildcard-to-regexp.mjs';

const isRange = /^((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+))-((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+))$/;

/** If both inputs are numerical, returns them as numbers, otherwise leaves them as-is
 * @param {string} v1
 * @param {string} v2
 * @private
 * */
const toNumber = (v1, v2) => {
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

/**Inputs are equal without manipulations to the values
 * @param {string} v1
 * @param {string} v2
 * @private
 * @returns {boolean}
 */
const isStrictEqual = (v1, v2) => {
    return v1 === v2;
};

/**Inputs are equal when ignoring lowercase or converted to numbers
 * @param {string} v1
 * @param {string} v2
 * @private
 * @returns {boolean}
 */
const isLooseEqual = (v1, v2) => {
    if (v1 === v2) {
        return true;
    }
    if (v1.toLowerCase() === v2.toLowerCase()) {
        return true;
    }
    const [v1Num, v2Num] = toNumber(v1, v2);
    return v1Num === v2Num;
};

/**The first input is less than the second
 * @param {string} v1
 * @param {string} v2
 * @private
 * @returns {boolean}
 */
const isLessThan = (v1, v2) => {
    [v1, v2] = toNumber(v1, v2);
    if (Number.isNaN(v1) || Number.isNaN(v2)) {
        return false;
    }
    return v1 < v2;
};

/**The first input is less than or equal to the second
 * @param {string} v1
 * @param {string} v2
 * @private
 * @returns {boolean}
 */
const isLessThanOrEqual = (v1, v2) => {
    [v1, v2] = toNumber(v1, v2);
    if (Number.isNaN(v1) || Number.isNaN(v2)) {
        return false;
    }
    return v1 <= v2;
};

/**The first input is greater than the second
 * @param {string} v1
 * @param {string} v2
 * @private
 * @returns {boolean}
 */
const isGreaterThan = (v1, v2) => {
    [v1, v2] = toNumber(v1, v2);
    if (Number.isNaN(v1) || Number.isNaN(v2)) {
        return false;
    }
    return v1 > v2;
};

/**The first input is greater than or equal to the second
 * @param {string} v1
 * @param {string} v2
 * @private
 * @returns {boolean}
 */
const isGreaterThanOrEqual = (v1, v2) => {
    [v1, v2] = toNumber(v1, v2);
    if (Number.isNaN(v1) || Number.isNaN(v2)) {
        return false;
    }
    return v1 >= v2;
};

/**The input is not null or an empty string
 * @param {string} v1
 * @private
 * @returns {boolean}
 */
const exists = (v1) => {
    return v1 != null && v1 !== '';
};

/**The first input is a number. If the second input is specified, the first input must fall within the second argument's range
 * @param {string} v1
 * @param {string} [v2] Range formatted as N-N2, where N is the lower bound and N2 is the upperbound (inclusive)
 * @private
 * @returns {boolean}
 */
const isNumber = (v1, v2) => {
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

    if (Number.isNaN(r2)) {
        return v1 === r1;
    }

    if (r1 > r2) {
        return (r2 <= v1 && v1 <= r1);
    }
    return (r1 <= v1 && v1 <= r1);
};

/**The first input matches the regexp pattern of the second input
 * @param {string} v1
 * @param {string} v2
 * @private
 * @returns {boolean}
 */
const isRegexMatch = (v1, v2) => {
    const parts = /^\/(.*)\/([a-z]*)$/i.exec(v2);
    if (parts) {
        return (new RegExp(parts[1], parts[2])).test(v1);
    }
    return (new RegExp(v2)).test(v1);
};

/**The first input matches the wildcard pattern of the second input
 * @param {string} v1
 * @param {string} v2
 * @private
 * @returns {boolean}
 */
const isWildcardMatch = (v1, v2) => {
    if (v2 === null || v2 == '') {
        return false;
    }
    return wildcardToRegExp(v2, false).test(v1);
}

/**The first input matches the wildcard pattern of the second input, case-sensitive
 * @param {string} v1
 * @param {string} v2
 * @private
 * @returns {boolean}
 */
const isWildcardMatchCaseSensitive = (v1, v2) => {
    if (v2 === null || v2 == '') {
        return false;
    }
    return wildcardToRegExp(v2, true).test(v1);
};

export default {
    '===': {
        type: 'condition',
        left: true,
        right: true,
        description: 'Left side equals right side, case sensitive',
        example: 'v1 === v2',
        evaluator: isStrictEqual
    },
    '!==': {
        type: 'condition',
        left: true,
        right: true,
        description: 'Left side does not equal right side, case sensitive',
        example: 'v1 !== v2',
        evaluator: (v1, v2) => !(isStrictEqual(v1, v2))
    },
    '==': {
        type: 'condition',
        left: true,
        right: true,
        description: 'Left side equals right side, case insensitive',
        example: 'v1 == v2',
        evaluator: isLooseEqual
    },
    '!=': {
        type: 'condition',
        left: true,
        right: true,
        description: 'Left side does not equal right side, case insensitive',
        example: 'v1 != v2',
        evaluator: (v1, v2) => !(isLooseEqual(v1, v2))
    },
    '<': {
        type: 'condition',
        left: true,
        right: true,
        description: 'Left side is less than right side',
        example: 'v1 < v2',
        evaluator: isLessThan
    },
    '<=': {
        type: 'condition',
        left: true,
        right: true,
        description: 'Left side is less or equal to right side',
        example: 'v1 <= v2',
        evaluator: isLessThanOrEqual
    },
    '>': {
        type: 'condition',
        left: true,
        right: true,
        description: 'Left side is greater than right side',
        example: 'v1 > v2',
        evaluator: isGreaterThan
    },
    '>=': {
        type: 'condition',
        left: true,
        right: true,
        description: 'Left side is greater than or equal to right side',
        example: 'v1 >= v2',
        evaluator: isGreaterThanOrEqual
    },
    'exists': {
        type: 'condition',
        left: true,
        right: false,
        description: 'Left side is not an empty string',
        example: 'v1 exists',
        evaluator: exists
    },
    '!exists': {
        type: 'condition',
        left: true,
        right: false,
        description: 'Left side is an empty string',
        example: 'v1 !exists',
        evaluator: (v1) => !(exists(v1))
    },
    'isnumber': {
        type: 'condition',
        left: true,
        right: 'optional',
        description: [
            {
                description: 'Left side is a numerical value',
                example: 'v1 isnumber'
            }, {
                description: 'Left side is a numerical value that falls within the range of the rightside (inclusive)',
                example: 'v1 isnumber 5-10'
            }
        ],
        evaluator: isNumber
    },
    '!isnumber': {
        type: 'condition',
        left: true,
        right: 'optional',
        description: [
            {
                description: 'Left side is not a numerical value',
                example: 'v1 !isnumber'
            }, {
                description: 'Left side is not a numerical value that falls within the range of the rightside (inclusive)',
                example: 'v1 !isnumber 5-10'
            }
        ],
        evaluator: (v1, v2) => !(isNumber(v1, v2))
    },
    'regex': {
        type: 'condition',
        left: true,
        right: true,
        description: 'Left side matches the right side Regular-Expression',
        example: 'v1 regex /v/i',
        evaluator: isRegexMatch
    },
    '!regex': {
        type: 'condition',
        left: true,
        right: true,
        description: 'Left side does not match the right side Regular-Expression',
        example: 'v1 !regex /a/i',
        evaluator: (v1, v2) => !(isRegexMatch(v1, v2))
    },
    'wildcard': {
        type: 'condition',
        left: true,
        right: true,
        description: "Left side matches the right side wildcard pattern",
        example: 'v1 wildcard ?1',
        evaluator: isWildcardMatch
    },
    '!wildcard': {
        type: 'condition',
        left: true,
        right: true,
        description: "Left side does not match the right side wildcard pattern",
        example: 'v1 !wildcard a?',
        evaluator: (v1, v2) => !(isWildcardMatch(v1, v2))
    },
    'wildcardcs': {
        type: 'condition',
        left: true,
        right: true,
        description: "Left side matches the right side wildcard pattern; case sensitive",
        example: 'v1 wildcardcs V?',
        evaluator: (v1, v2) => isWildcardMatchCaseSensitive(v1, v2)
    },
    '!wildcardcs': {
        type: 'condition',
        left: true,
        right: true,
        description: "Left side does not match the right side wildcard pattern; case sensitive",
        example: 'v1 !wildcardcs v?',
        evaluator: (v1, v2) => !(isWildcardMatchCaseSensitive(v1, v2))
    },
    'AND': {
        type: 'operator',
        left: true,
        right: true,
        description: 'Both conditions must be true for the whole condition to be true',
        example: '[a == a] AND [b == b]',
        evaluator: (v1, v2) => (v1 && v2)
    },
    'OR': {
        type: 'operator',
        left: true,
        right: true,
        description: 'Atleast one condition must be true for the whole condition to be true',
        example: '[a == b] OR [c == c]',
        evaluator: (v1, v2) => (v1 || v2)
    },
    'NOT': {
        type: 'operator',
        left: false,
        right: true,
        description: 'The following condition must not be true for the whole condition to be true',
        example: 'NOT [a == b]',
        evaluator: (v2) => (!v2)
    }
};