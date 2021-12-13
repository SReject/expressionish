import { ExpressionSyntaxError } from '../errors.mjs';

import types from '../helpers/token-types.mjs';

import tokenizeEscape from './escape.mjs';

// characters that can be escaped inside of quoted text
const ESC_QUOTE = '"\\';

export default function (result, tokens) {
    if (!tokens.length || tokens[0].value !== '"') {
        return false;
    }

    const openToken = tokens.shift();

    let text = [],
        token;

    while (tokens.length) {
        token = tokens.shift();

        if (token.value === '"') {
            text = text.map(item => item.value).join('');

            if (result.length && result[result.length - 1].type === types.LITERAL_TEXT) {
                result[result.length - 1].value += text;
            } else {
                result.push({
                    value: text,
                    position: openToken.position + 1
                });
            }
            return true;
        }

        if (tokenizeEscape(text, tokens, ESC_QUOTE)) {
            continue;
        }

        token.type = types.LITERAL_TEXT;
        text.push(token);
    }

    // End quote wasn't encountered in the loop
    throw new ExpressionSyntaxError('end quote missing', openToken.position);
};