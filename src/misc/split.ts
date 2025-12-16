import { type GenericToken } from '../types';

/*!
The MIT License (MIT) @ Copyright (c) 2016 Justin Sippel, Vitaly Domnikov
https://github.com/bluelovers/runes/blob/8013b6e4021a41d6b579d76b3332c87389c5f092/LICENSE
*/
const HIGH_SURROGATE_START = 0xd800;
const HIGH_SURROGATE_END = 0xdbff;
const LOW_SURROGATE_START = 0xdc00;
const REGIONAL_INDICATOR_START = 0x1f1e6;
const REGIONAL_INDICATOR_END = 0x1f1ff;
const FITZPATRICK_MODIFIER_START = 0x1f3fb;
const FITZPATRICK_MODIFIER_END = 0x1f3ff;
const VARIATION_MODIFIER_START = 0xfe00;
const VARIATION_MODIFIER_END = 0xfe0f;
const DIACRITICAL_MARKS_START = 0x20d0;
const DIACRITICAL_MARKS_END = 0x20ff;
const ZWJ = 0x200d;
const GRAPHEMS = new Set([
    0x0308, // ( ◌̈ ) COMBINING DIAERESIS
    0x0937, // ( ष ) DEVANAGARI LETTER SSA
    0x093F, // ( ि ) DEVANAGARI VOWEL SIGN I
    0x0BA8, // ( ந ) TAMIL LETTER NA
    0x0BBF, // ( ி ) TAMIL VOWEL SIGN I
    0x0BCD, // ( ◌்) TAMIL SIGN VIRAMA
    0x0E31, // ( ◌ั ) THAI CHARACTER MAI HAN-AKAT
    0x0E33, // ( ำ ) THAI CHARACTER SARA AM
    0x0E40, // ( เ ) THAI CHARACTER SARA E
    0x0E49, // ( เ ) THAI CHARACTER MAI THO
    0x1100, // ( ᄀ ) HANGUL CHOSEONG KIYEOK
    0x1161, // ( ᅡ ) HANGUL JUNGSEONG A
    0x11A8  // ( ᆨ ) HANGUL JONGSEONG KIYEOK
]);

const betweenInclusive = (value: number, lower: number, upper: number) => {
    return (value >= lower && value <= upper);
};

const codePointFromSurrogatePair = (pair: string) => {
    const highOffset = pair.charCodeAt(0) - HIGH_SURROGATE_START;
    const lowOffset = pair.charCodeAt(1) - LOW_SURROGATE_START;
    return (highOffset << 10) + lowOffset + 0x10000;
};

/** Splits the input into an array of unicode-aware characters
 * @returns {string[]} An array containing the delimited characters where each entry is a character
*/
export const split = (
    /** Input text to split into characters */
    input: string
) : string[] => {
    if (typeof input !== 'string') {
        throw new Error('string cannot be undefined or null')
    }
    const result : string[] = [];
    let idx = 0;
    let inc = 0;
    while (idx < input.length) {
        const idxInc = idx + inc;
        const current = input[idxInc];
        if (
            idxInc < (input.length - 1) &&
            current &&
            betweenInclusive(current.charCodeAt(0), HIGH_SURROGATE_START, HIGH_SURROGATE_END)
        ) {
            const currPair = codePointFromSurrogatePair(current + input[idxInc + 1]);
            const nextPair = codePointFromSurrogatePair(input.substring(idxInc + 2, idxInc + 5));
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
        if (GRAPHEMS.has((input[idx + inc] + '').charCodeAt(0))) {
            inc += 1;
        }
        if (betweenInclusive((input[idx + inc] + '').charCodeAt(0), VARIATION_MODIFIER_START, VARIATION_MODIFIER_END)) {
            inc += 1;
        }
        if (betweenInclusive((input[idx + inc] + '').charCodeAt(0), DIACRITICAL_MARKS_START, DIACRITICAL_MARKS_END)) {
            inc += 1;
        }
        if ((input[idx + inc] + '').charCodeAt(0) === ZWJ) {
            inc += 1;
            continue;
        }
        result.push(input.substring(idx, idx + inc));
        idx += inc;
        inc = 0;
    }
    return result;
};

/** Converts the input into a list of Generic tokens for further processing
 * * Unicode multi-byte/character glyphs are treated as a singular entry
 * * Each whitespace character is treated as a singular entry
 * * `\` is treated as a singular entry, the following character is also treated as a singular entry regardless of what it is
 * * \`\` is treated as a singular entry
 * * All other ascii punctionation is treated as a singular entry
 * * Non-unicode characters that are not whitespace or punctuation are grouped together and treated as a singular entry
*/
export const tokenize = (input: string) : GenericToken[] => {

    if (typeof input !== 'string') {
        throw new Error('string cannot be undefined or null')
    }

    // eslint-disable-next-line no-control-regex
    const asciiPunct = /^[\x01-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]$/;

    const result : GenericToken[] = [];
    let idx = 0;
    let inc = 0;
    let tok = null;
    let escaped = false;
    while (idx < input.length) {
        const idxInc = idx + inc;
        const current = input[idxInc];

        // unicode multi-byte character
        if (
            idxInc < (input.length - 1) &&
            current &&
            betweenInclusive(current.charCodeAt(0), HIGH_SURROGATE_START, HIGH_SURROGATE_END)
        ) {
            const currPair = codePointFromSurrogatePair(current + input[idxInc + 1]);
            const nextPair = codePointFromSurrogatePair(input.substring(idxInc + 2, idxInc + 5));
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
        if (GRAPHEMS.has((input[idx + inc] + '').charCodeAt(0))) {
            inc += 1;
        }
        if (betweenInclusive((input[idx + inc] + '').charCodeAt(0), VARIATION_MODIFIER_START, VARIATION_MODIFIER_END)) {
            inc += 1;
        }
        if (betweenInclusive((input[idx + inc] + '').charCodeAt(0), DIACRITICAL_MARKS_START, DIACRITICAL_MARKS_END)) {
            inc += 1;
        }
        if ((input[idx + inc] + '').charCodeAt(0) === ZWJ) {
            inc += 1;
            continue;
        }

        // Emoji/unicode character
        if (inc > 1) {
            if (tok != null) {
                result.push(tok);
                tok = null;
            }
            result.push({ position: idx, value: input.substring(idx, idx + inc) });
            escaped = false;

        // block-escape denoter
        } else if (input.substring(idx, idx + 1) === '``') {
            if (escaped) {
                result.push({ position: idx, value: '`'});
                escaped = false;
            } else {
                if (tok != null) {
                    result.push(tok);
                    tok = null;
                }
                result.push({ position: idx, value: '``'});
                inc += 2;
            }

        // singular character escape denoter
        } else if (input[idx] === '\\') {
            if (tok != null) {
                result.push(tok);
                tok = null;
            }
            result.push({ position: idx, value: '\\'});
            escaped = !escaped;

        // All ascii punctuation and whitespace assumed to be potentially significant
        } else if (asciiPunct.test(input[idx])) {
            if (tok != null) {
                result.push(tok);
                tok = null;
            }
            result.push({ position: idx, value: input[idx] });
            escaped = false;

        // Non-emoji, non-punctuation, no-whitespace characters
        } else if (escaped) {
            result.push({ position: idx, value: input[idx] });
            escaped = false;
        } else if (tok == null) {
            tok = { position: idx, value: input[idx] };
        } else {
            tok.value += input[idx];
        }

        idx += inc;
        inc = 0;
    }
    if (tok != null) {
        result.push(tok);
    }

    return result;
};