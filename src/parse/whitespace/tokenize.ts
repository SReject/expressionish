import type { GenericToken, TokenizeResult } from '../../types';

/** Attempts to consume sequential whitespace from `tokens` beginning at `cursor` */
export default ((
    /** List of generic tokens to be tokenized into Token instances */
    tokens: GenericToken[],

    /** Current position within the tokens list */
    cursor: number
) : TokenizeResult<string> => {
    const count = tokens.length;
    if (cursor >= count) {
        return [false];
    }

    let ws = '';
    let index = cursor;
    while (index < count && (
        tokens[index].value === ' '  ||
        tokens[index].value === '\n' ||
        tokens[index].value === '\r' ||
        tokens[index].value === '\t' ||
        tokens[index].value === '\b' ||
        tokens[index].value === '\f'
    )) {
        ws += tokens[index].value;
        index += 1;
    }

    if (cursor === index) {
        return [false];
    }
    return [true, index, ws];
});