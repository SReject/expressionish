import { ExpressionSyntaxError } from '../errors.mjs';

import types from '../helpers/token-types.mjs';

import consumeEscapeSequence from './escape.mjs';

// characters that can be escaped inside of quoted text
const QUOTE_ESC_CHARS = '"\\';

export default (state, tokens) => {
    let cursor = state.cursor;
    const {value: tokenValue, position: tokenPosition } = tokens[cursor];

    if (tokenValue !== '"') {
        return;
    }

    const startPosition = tokenPosition;
    const startCursor = cursor;

    let result = '';

    cursor += 1;
    while (cursor < tokens.length) {
        const {value} = tokens[cursor];

        // end of quote
        if (value === '"') {
            // replace all tokens that make up the quoted text w/ a single LITERAL_TEXT token
            tokens.splice(
                startCursor,
                1 + (cursor - startCursor),
                {value: result, position: startPosition, type: types.LITERAL_TEXT}
            );

            state.consumed = true;
            state.cursor += 1;
            return;
        }

        // Process escape sequences inside of the quote
        const escState = {consumed: false, cursor};
        consumeEscapeSequence(escState, tokens, QUOTE_ESC_CHARS);
        if (escState.consumed) {
            cursor = escState.cursor;
            result += tokens[cursor - 1].value;
            continue;
        }

        result += value;
        cursor += 1;
    }

    // End quote wasn't encountered in the loop
    throw new ExpressionSyntaxError(startPosition, 'end quote missing');
};