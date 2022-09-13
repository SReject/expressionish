import type { IToken } from '../tokens/base';

import {
    HIGH_SURROGATE_START,
    HIGH_SURROGATE_END,
    REGIONAL_INDICATOR_START,
    REGIONAL_INDICATOR_END,
    FITZPATRICK_MODIFIER_START,
    FITZPATRICK_MODIFIER_END,
    VARIATION_MODIFIER_START,
    VARIATION_MODIFIER_END,
    DIACRITICAL_MARKS_START,
    DIACRITICAL_MARKS_END,
    ZWJ,
    GRAPHEMS,
    betweenInclusive,
    codePointFromSurrogatePair
} from './unicode-safe-split';

/** Split input string into array of potential tokens */
export default (subject: string) : IToken[] => {

    if (typeof subject !== 'string') {
        throw new Error('string cannot be undefined or null')
    }

    const result : IToken[] = [];
    let token : IToken | null = null;
    let idx = 0;
    let inc = 0;

    while (idx < subject.length) {
        const idxInc = idx + inc;
        const current = subject[idxInc];
        if (
            idxInc < (subject.length - 1) &&
            current &&
            betweenInclusive(current.charCodeAt(0), HIGH_SURROGATE_START, HIGH_SURROGATE_END)
        ) {
            const currPair = codePointFromSurrogatePair(current + subject[idxInc + 1]);
            const nextPair = codePointFromSurrogatePair(subject.substring(idxInc + 2, idxInc + 5));
            if (
                betweenInclusive(currPair, REGIONAL_INDICATOR_START, REGIONAL_INDICATOR_END) &&
                betweenInclusive(nextPair, REGIONAL_INDICATOR_START, REGIONAL_INDICATOR_END)
            ) {
                inc += 4;
            } else if (betweenInclusive(nextPair, FITZPATRICK_MODIFIER_START, FITZPATRICK_MODIFIER_END)) {
                inc += 4;
            } else {
                inc += 2;
            }
        } else {
            inc += 1;
        }
        if (GRAPHEMS.has((subject[idx + inc] + '').charCodeAt(0))) {
            inc += 1;
        }
        if (betweenInclusive((subject[idx + inc] + '').charCodeAt(0), VARIATION_MODIFIER_START, VARIATION_MODIFIER_END)) {
            inc += 1;
        }
        if (betweenInclusive((subject[idx + inc] + '').charCodeAt(0), DIACRITICAL_MARKS_START, DIACRITICAL_MARKS_END)) {
            inc += 1;
        }
        if ((subject[idx + inc] + '').charCodeAt(0) === ZWJ) {
            inc += 1;
            continue;
        }

        const char = subject.substring(idx, idx + inc);

        // emoji
        if (inc > 1) {
            if (token == null) {
                token = {
                    position: idx,
                    value: char
                };
            }
            token.value += char;

        // possibily a multi token
        } else if (
            (char === '&' && subject[idx + 1] === '&') ||
            (char === '|' && subject[idx + 1] === '|') ||
            (char === '`' && subject[idx + 1] === '`') ||
            (char === '\\' && subject[idx + 1] != null)
        ) {
            if (token !== null) {
                result.push(token);
                token = null;
            }
            result.push({
                position: idx,
                value: `${char}${subject[idx + 1]}`
            });
            inc += 1;

        // possibly significant character
        } else if (!/^[a-z\d]$/i.test(char)) {
            if (token !== null) {
                result.push(token);
                token = null;
            }
            result.push({
                position: idx,
                value: char
            });

        // non significant non emoji character
        } else if (token == null) {
            token = {position: idx, value: char};
        } else {
            token.value += char;
        }

        idx += inc;
        inc = 0;
    }
    if (token != null) {
        result.push(token);
    }

    return result;
};