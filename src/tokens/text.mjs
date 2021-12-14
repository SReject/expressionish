import { ExpressionSyntaxError } from '../errors.mjs';
import types from '../helpers/token-types.mjs';

import BaseToken from './base.mjs';

export class TextToken extends BaseToken {
    constructor(options) {
        super({
            ...options,
            type: types.TEXT
        });
    }
}

export const tokenizeEscape = (output, tokens, escape) => {
    if (!tokens.length || tokens[0].value !== '\\') {
        return false;
    }

    if (escape == null) {
        escape = '"$[\\';
    }

    // get escape denoter character(\)
    let token = tokens.shift();

    // Denoter followed by non-escapable character - Treat as plain text
    if (
        tokens[0] == null ||
        escape.indexOf(tokens[0].value[0]) === -1
    ) {
        if (output[1] != null && output[output.length - 1].type === types.TEXT) {
            output[output.length - 1].value += token.value;
        } else {
            output.push(new TextToken(token));
        }
        return true;
    }

    // Get escaped token
    token = tokens.shift();

    // Escaped token contains more than one character
    // split escaped character from remaining token text
    if (token.length > 1) {
        tokens.unshift({
            position: token.position,
            value: token.value.slice(1)
        });
        token.value = token.value[0];
    }

    if (output.length && output[output.length - 1].type === types.TEXT) {
        output[output.length - 1].value += token.value;

    } else {
        output.push(new TextToken(token));
    }
    return true;
};

export const tokenizeQuote = (output, tokens) => {
    if (!tokens.length || tokens[0].value !== '"') {
        return false;
    }

    const openToken = tokens.shift();

    let text = [];
    while (tokens.length) {
        if (tokens[0].value === '"') {
            tokens.shift();
            text = text.map(item => item.value).join('');

            if (output.length && output[output.length - 1].type === types.TEXT) {
                output[output.length - 1].value += text;

            } else {
                output.push(new TextToken({
                    position: openToken.position + 1,
                    value: text
                }));
            }
            return true;
        }

        if (tokenizeEscape(text, tokens, '\\"')) {
            continue;
        }

        text.push(tokens.shift());
    }

    // End quote wasn't encountered in the loop
    throw new ExpressionSyntaxError('end quote missing', openToken.position);
};
