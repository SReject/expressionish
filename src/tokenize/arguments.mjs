import types from '../helpers/token-types.mjs';

import { ExpressionSyntaxError } from '../errors.mjs';

import tokenizeEscape from './escape.mjs';
import tokenizeQuotedText from './quoted-text.mjs';
import tokenizeIf from './if.mjs';
import tokenizeVariable from './variable.mjs';

const removeWhitespace = tokens => {
    let result = '';
    while (tokens.length && tokens[0].value === ' ') {
        tokens.shift()
        result += ' ';
    }
    return result;
}

export default function tokenizeArguments(result, tokens) {
    if (!tokens.length || tokens[0].value !== '[') {
        return false;
    }

    const openToken = tokens.shift();
    removeWhitespace(tokens);

    let parts = [];
    while (tokens.length) {
        let position = tokens[0].position,
            whitespace = removeWhitespace(tokens);

        if (tokens[0].value === ']') {
            tokens.shift();
            if (!parts.length) {
                parts = [{value: '', type: types.LITERAL_TEXT, position}];
            }
            result.push(parts);
            return true;
        }

        if (tokens[0].value === ',') {
            tokens.shift();
            removeWhitespace(tokens);
            if (!parts.length) {
                parts = [{value: '', type: types.LITERAL_TEXT, position}];
            }
            result.push(parts);
            parts = [];
            continue;
        }

        if (whitespace) {
            if (parts.length && parts[parts - 1].type === types.LITERAL_TEXT) {
                parts[parts.length - 1].value += whitespace;
            } else {
                parts.push({value: whitespace, type: types.LITERAL_TEXT, position});
            }
        }

        if (tokenizeEscape(parts, tokens)) {
            continue;
        }

        if (tokenizeQuotedText(parts, tokens)) {
            continue;
        }

        if (tokenizeIf(parts, tokens)) {
            continue;
        }

        if (tokenizeVariable(parts, tokens)) {
            continue;
        }

        // Treat all other tokens as plain text
        const token = tokens.shift();
        if (parts.length && parts[parts - 1].type === types.LITERAL_TEXT) {
            parts[parts.length - 1].value += token.value;
        } else {
            token.type = types.LITERAL_TEXT;
            parts.push(token);
        }
    }

    if (!tokens.length) {
        throw new ExpressionSyntaxError('Unexpected end of expression', openToken.position);
    }
    throw new ExpressionSyntaxError('expected end of variable arguments', openToken.position);
}