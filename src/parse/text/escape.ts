import type { GenericToken, TokenizeResult } from '../../types';

/** Attempts to consume an escape-sequence from `tokens` starting at `cursor` */
export default (

    /** List of generic tokens to be tokenized into Token instances */
    tokens: GenericToken[],

    /** Current position within the tokens list */
    cursor: number,

    /** Escapable character; defaults to "$[,]\\rnt and double backticks */
    escapeChars?: string
) : TokenizeResult<GenericToken> => {
    const count = tokens.length;

    if ((cursor + 1) >= count || tokens[cursor].value != '\\') {
        return [false];
    }

    if (escapeChars == null) {
        escapeChars = '"$[,]\\rnt`'
    }

    // block-escape indicator escaped
    if (
        escapeChars.includes('`') &&
        tokens[cursor + 1].value === '`' &&
        tokens[cursor + 2].value === '`'
    ) {
        return [ true, cursor + 3, { position: cursor, value: '``' } ];
    }

    // Escape Denoter followed by non-escape char
    // Treat the Escape Denoter as the escaped char (e.g. '\' -> '\\')
    if (!escapeChars.includes(tokens[cursor + 1].value)) {
        return [true, cursor + 1, { position: cursor, value: '\\' }];
    }

    cursor += 1;
    const token = { ...tokens[cursor] };

    switch (token.value) {
        case 'n':
            token.value = '\n';
            break;

        case 'r':
            token.value = '\r';
            break;

        case 't':
            token.value = '\t';
            break;
    }

    return [true, cursor + 1, token];
};