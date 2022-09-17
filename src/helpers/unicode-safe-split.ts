/*
The MIT License (MIT) @ Copyright (c) 2016 Justin Sippel, Vitaly Domnikov
https://github.com/bluelovers/runes/blob/8013b6e4021a41d6b579d76b3332c87389c5f092/LICENSE
*/
export const HIGH_SURROGATE_START = 0xd800;
export const HIGH_SURROGATE_END = 0xdbff;
export const LOW_SURROGATE_START = 0xdc00;
export const REGIONAL_INDICATOR_START = 0x1f1e6;
export const REGIONAL_INDICATOR_END = 0x1f1ff;
export const FITZPATRICK_MODIFIER_START = 0x1f3fb;
export const FITZPATRICK_MODIFIER_END = 0x1f3ff;
export const VARIATION_MODIFIER_START = 0xfe00;
export const VARIATION_MODIFIER_END = 0xfe0f;
export const DIACRITICAL_MARKS_START = 0x20d0;
export const DIACRITICAL_MARKS_END = 0x20ff;
export const ZWJ = 0x200d;
export const GRAPHEMS = new Set([
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

export const betweenInclusive = (value: number, lower: number, upper: number) : boolean => {
    return (value >= lower && value <= upper);
};

export const codePointFromSurrogatePair = (pair: string) : number => {
    const highOffset = pair.charCodeAt(0) - HIGH_SURROGATE_START;
    const lowOffset = pair.charCodeAt(1) - LOW_SURROGATE_START;
    return (highOffset << 10) + lowOffset + 0x10000;
};

/** Splits input text into an array of characters */
export default (
    subject : string,
    callback?: (subject: string, char: string, position: number) => number | void
) : string[] => {

    if (typeof subject !== 'string') {
        throw new Error('string cannot be undefined or null')
    }

    const result : string[] = [];
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
        if (callback) {
            const cbres = callback(subject, char, idx);
            if (cbres != null) {
                inc += <number>cbres;
            }
        }
        result.push(char);
        idx += inc;
        inc = 0;
    }
    return result;
};