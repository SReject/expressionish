import split from './unicode-split.mjs';

/** If both inputs are numerical, returns them as numbers, otherwise leaves them as-is*/
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

const isStrictEqual = (v1, v2) => {
    return v1 === v2;
};
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
const isLessThan = (v1, v2) => {
    [v1, v2] = toNumber(v1, v2);
    if (Number.isNaN(v1) || Number.isNaN(v2)) {
        return false;
    }
    return v1 < v2;
};
const isLessThanOrEqual = (v1, v2) => {
    [v1, v2] = toNumber(v1, v2);
    if (Number.isNaN(v1) || Number.isNaN(v2)) {
        return false;
    }
    return v1 <= v2;
};
const isGreaterThan = (v1, v2) => {
    [v1, v2] = toNumber(v1, v2);
    if (Number.isNaN(v1) || Number.isNaN(v2)) {
        return false;
    }
    return v1 > v2;
};
const isGreaterThanOrEqual = (v1, v2) => {
    [v1, v2] = toNumber(v1, v2);
    if (Number.isNaN(v1) || Number.isNaN(v2)) {
        return false;
    }
    return v1 >= v2;
};
const exists = (v1) => {
    return v1 != null && v1 !== '';
};
const isRange = /^((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+))(?:-((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+)))?$/;
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
const isRegexMatch = (v1, v2) => {
    const parts = /^\/(.*)\/([a-z]*)$/i.exec(v2);
    if (parts) {
        return (new RegExp(parts[1], parts[2])).test(v1);
    }
    return (new RegExp(v2)).test(v1);
};
const wildcardToRegExp = (wc, caseSensitive) => {
    wc = split(wc);

    let isStart = true;
    let startAnchor = true;
    let endAnchor = true;
    let tokenQCount = 0;
    let tokenACount = 0;
    let pattern = '';
    let idx = 0;
    while (idx < wc.length) {

        const char = wc[idx];

        // Char needs to be escaped
        if (
            char === '^' ||
            char === '.' ||
            char === '-' ||
            char === '+' ||
            char === '\\' ||
            char === '/' ||
            char === '|' ||
            char === '(' ||
            char === ')' ||
            char === '[' ||
            char === ']' ||
            char === '{' ||
            char === '}' ||
            char === '$'
        ) {
            pattern = pattern + `\\${char}`;
            processTokens = true;

        // Wildcard characters
        } else if (char === '*') {
            tokenACount += 1;
        } else if (char === '?') {
            tokenQCount += 1;

        // Non-special character
        } else {
            pattern = pattern + char;
            processTokens = true;
        }

        const isEnd = (idx + 1) === wc.length;
        if (processTokens || (isEnd && (tokenQCount || tokenACount))) {
            let useAstericks = false;

            if (tokenACount) {
                if (isStart) {
                    startAnchor = false;
                } else if (isEnd) {
                    endAnchor = false;
                } else {
                    useAstericks = true;
                }
            }

            if (useAstericks) {
                if (tokenQCount) {
                    pattern = pattern + '.'.repeat(tokenQCount) + '+';
                } else {
                    pattern = pattern + '.*';
                }
            } else if (tokenQCount) {
                pattern = pattern + '.'.repeat(tokenQCount);
            }

            tokenQCount = 0;
            tokenACount = 0;
            processTokens = false;
            isStart = false;
        }

        idx += 1;
    }

    if (startAnchor) {
        pattern = '^' + pattern;
    }
    if (endAnchor) {
        pattern = pattern + '$';
    }

    return new RegExp(pattern, caseSensitive ? '' : 'i');
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

    // Wildcard
    'wildcard': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: isWildcardMatch
    },
    '!wildcard': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => !(isWildcardMatch(v1, v2))
    },
    'wildcardcs': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => isWildcardMatchCaseSensitive(v1, v2)
    },
    '!wildcardcs': {
        type: 'condition',
        left: true,
        right: true,
        evaluator: (v1, v2) => !(isWildcardMatchCaseSensitive(v1, v2))
    },

    // Logic Operators
    'AND': {
        type: 'operator',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 && v2)
    },
    'OR': {
        type: 'operator',
        left: true,
        right: true,
        evaluator: (v1, v2) => (v1 || v2)
    },
    'NOT': {
        type: 'operator',
        left: false,
        right: true,
        evaluator: (v1) => (!v1)
    }
};