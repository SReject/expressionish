import types from '../helpers/token-types.mjs';
import { removeWhitespace } from '../helpers/misc.mjs';

import { ExpressionSyntaxError } from '../errors.mjs';

import { tokenizeEscape, tokenizeQuote, TextToken } from './text.mjs';
import { default as tokenizeIf } from './if.mjs';
import { default as tokenizeVariable } from './variable.mjs';

// tokenizeArguments();
export default (output, tokens) => {
    if (!tokens.length || tokens[0].value !== '[') {
        return false;
    }

    tokens.shift();
    removeWhitespace(tokens);

    let parts = [];
    while (tokens.length) {
        let position = tokens[0].position,
            whitespace = removeWhitespace(tokens);

        // End of arguments list
        if (tokens[0].value === ']') {
            tokens.shift();
            if (!parts.length) {
                parts = [new TextToken({position, value: ''})]
            }
            output.push(parts);
            return true;
        }

        // End of argument
        if (tokens[0].value === ',') {
            tokens.shift();
            removeWhitespace(tokens);
            if (!parts.length) {
                parts = [new TextToken({position, value: ''})];
            }
            output.push(parts);
            parts = [];
            continue;
        }

        // Add whitespace to argument part's list
        if (whitespace) {
            if (parts.length && parts[parts.length - 1].type === types.TEXT) {
                parts[parts.length - 1].value += whitespace;

            } else {
                parts.push(new TextToken({position, value: whitespace}));
            }
        }

        // Consume tokens
        if (tokenizeEscape(parts, tokens, '"$,\\]')) {
            continue;
        }

        if (tokenizeQuote(parts, tokens)) {
            continue;
        }

        if (tokenizeIf(parts, tokens)) {
            continue;
        }

        if (tokenizeVariable(parts, tokens)) {
            continue;
        }

        // Consume all other tokens as text
        const token = tokens.shift();
        if (parts.length && parts[parts.length - 1].type === types.TEXT) {
            parts[parts.length - 1].value += token.value;
        } else {
            parts.push(new TextToken(token));
        }
    }


    if (!tokens.length) {
        throw new ExpressionSyntaxError('Unexpected end of expression', openToken.position);
    }
    throw new ExpressionSyntaxError('expected end of variable arguments', openToken.position);
};