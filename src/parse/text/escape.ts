import type { GenericToken, TokenizeResult } from '../../types';

export default (tokens: GenericToken[], cursor: number, escapeChars?: string) : TokenizeResult<GenericToken> => {
    const count = tokens.length;

    if ((cursor + 1) >= count || tokens[cursor].value != '\\') {
        return [false];
    }

    if (escapeChars == null) {
        escapeChars = '"$[,]\\rnt'
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