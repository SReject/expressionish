import type { GenericToken, TokenizeResult } from '../../types';

import tokenizeEscape from './escape';
import TextToken from './token';

import { ExpressionSyntaxError } from '../../errors';

/** Attempts to consume quoted text from `tokens` starting at `cursor` */
export default (

    /** List of generic tokens to be tokenized into Token instances */
    tokens: GenericToken[],

    /** Current position within the tokens list */
    cursor: number
) : TokenizeResult<TextToken> => {
    const count = tokens.length;

    if (
        cursor >= count ||
        tokens[cursor] == null ||
        tokens[cursor].value !== '"'
    ) {
        return [false];
    }

    const start = cursor;
    cursor += 1;

    let text : string = '';
    while (cursor < count) {
        if (tokens[cursor].value === '"') {
            return [
                true,
                cursor + 1,
                new TextToken({
                    position: start,
                    value: text
                })
            ]
        }

        const [tokenized, tokenizeCursor, tokenizeResult] = tokenizeEscape(tokens, cursor, '\\"nrt');
        if (tokenized) {
            cursor = tokenizeCursor;
            text += tokenizeResult.value;
            continue;
        }

        text += tokens[cursor].value;
        cursor += 1;
    }

    throw new ExpressionSyntaxError('End quote missing', tokens[start].position);
}