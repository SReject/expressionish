import { split } from './split.mjs';

export default (input, caseSensitive) => {
    let wc = split(input);

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