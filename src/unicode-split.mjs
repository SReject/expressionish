/*
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
const GRAPHEMS = [
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
	0x11A8, // ( ᆨ ) HANGUL JONGSEONG KIYEOK
];

const nextUnits = (i, string) => {
	const current = string[i]
	if (!current || !betweenInclusive(current[0].charCodeAt(0), HIGH_SURROGATE_START, HIGH_SURROGATE_END) || i === string.length -1) {
		return 1;
	}
	const currentPair = current + string[i + 1]
	let nextPair = string.substring(i + 2, i + 5)
	if (isRegionalIndicator(currentPair) && isRegionalIndicator(nextPair)) {
		return 4
	}
	if (betweenInclusive(codePointFromSurrogatePair(nextPair), FITZPATRICK_MODIFIER_START, FITZPATRICK_MODIFIER_END)) {
		return 4
	}
	return 2
};

const betweenInclusive = (value, lower, upper) => (value >= lower && value <= upper);
const isRegionalIndicator = string => betweenInclusive(codePointFromSurrogatePair(string), REGIONAL_INDICATOR_START, REGIONAL_INDICATOR_END);
const codePointFromSurrogatePair = pair => {
	const highOffset = pair.charCodeAt(0) - HIGH_SURROGATE_START
	const lowOffset = pair.charCodeAt(1) - LOW_SURROGATE_START
	return (highOffset << 10) + lowOffset + 0x10000
};
const isGraphem = string => (typeof string === 'string' && GRAPHEMS.indexOf(string.charCodeAt(0)) !== -1);
const isVariationSelector = string => (typeof string === 'string' && betweenInclusive(string.charCodeAt(0), VARIATION_MODIFIER_START, VARIATION_MODIFIER_END));
const isDiacriticalMark = string => (typeof string === 'string' && betweenInclusive(string.charCodeAt(0), DIACRITICAL_MARKS_START, DIACRITICAL_MARKS_END));
const isZeroWidthJoiner = string => (typeof string === 'string' && string.charCodeAt(0) === ZWJ);
export default string => {
	if (typeof string !== 'string') {
		throw new Error('string cannot be undefined or null')
	}
	const result = []
	let i = 0
	let increment = 0
	while (i < string.length) {
		increment += nextUnits(i + increment, string)
		if (isGraphem(string[i + increment])) {
			increment++
		}
		if (isVariationSelector(string[i + increment])) {
			increment++
		}
		if (isDiacriticalMark(string[i + increment])) {
			increment++
		}
		if (isZeroWidthJoiner(string[i + increment])) {
			increment++
			continue
		}
		result.push(string.substring(i, i + increment))
		i += increment
		increment = 0
	}
	return result
};