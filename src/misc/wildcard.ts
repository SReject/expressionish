import { split } from './split';

/** Converts `input` as a wildcard pattern into a `RegExp` instance */
export default (input: string, caseSensitive?: boolean) : RegExp => {
    const wc = split(input);

    let isStart = true;
    let startAnchor = true;
    let endAnchor = true;
    let tokenQCount = 0;
    let tokenACount = 0;
    let pattern = '';
    let idx = 0;
    let processTokens = false;
    while (idx < wc.length) {

        let char : string | null = wc[idx];

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
            char = `\\${char}`;
            processTokens = true;

        // Wildcard characters
        } else if (char === '*') {
            tokenACount += 1;
            char = null;

        } else if (char === '?') {
            tokenQCount += 1;
            char = null;

        // Non-special character
        } else {
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

            if (char != null) {
                pattern += char;
            }

            tokenQCount = 0;
            tokenACount = 0;
            isStart = false;
            processTokens = false;
        } else if (char) {
            pattern += char;
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