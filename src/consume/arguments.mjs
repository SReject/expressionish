import types from '../helpers/token-types.mjs';

import consumeCondition from './condition.mjs';
import consumeEscapeSequence from './escape.mjs';
import consumeQuotedText from './quoted-text.mjs';
import consumeVariable from './variable.mjs';

const removeWhitespace = (tokens, cursor) => {
    let result = '';
    while (cursor < tokens.length && tokens[cursor].value === ' ') {
        result += ' ';
        tokens.splice(cursor, 1);
    }
    return result;
}

export default (argState, tokens) => {
    const variableToken = argState.token;

    let cursor = argState.cursor;

    let token = tokens[cursor];

    if (!token || token.value !== '[') {
        return;
    }

    // remove the opening bracket and following whitespace from tokens list
    tokens.splice(cursor, 1);
    removeWhitespace(tokens, cursor);

    variableToken.args = [];

    // $if[] - Consume condition argument
    if (argState.isIf) {
        const condState = { token: variableToken, cursor };

        if (!consumeCondition(condState, tokens)) {
            throw new Error('Expected condition');
        }
        cursor = argState.cursor = condState.cursor;

        // remove leading whitespace
        removeWhitespace(tokens, cursor);

        // Insure next token is a comma and remove the comma token
        if (!tokens[cursor] || tokens[cursor].value !== ',') {
            throw new Error('Expected arguments delimiter');
        }
        tokens.splice(cursor, 1);

        // Remove trailing whitespace
        removeWhitespace(tokens, cursor);
    }

    let argParts = [];
    while (cursor < tokens.length) {

        // consume leading whitespace
        let position = tokens[cursor].position,
            whitespace = removeWhitespace(tokens, cursor);

        // Attempt to consume escape sequence
        if (consumeEscapeSequence({cursor}, tokens)) {
            // prepend leading whitespace to escaped character
            tokens[cursor].position = position;
            tokens[cursor].value = whitespace + tokens[cursor].value;
            if (
                argParts.length &&
                argParts[argParts.length - 1].type === types.LITERAL_TEXT
            ) {
                argParts[argParts.length - 1].value += tokens[cursor].value;
            } else {
                argParts.push(tokens[cursor]);
            }
            tokens.splice(cursor, 1);
            continue;
        }

        // Attempt to consume quoted text
        if (consumeQuotedText({cursor}, tokens)) {
            // prepend leading whitespace to escaped character
            tokens[cursor].position = position;
            tokens[cursor].value = whitespace + tokens[cursor].value;
            if (
                argParts.length &&
                argParts[argParts.length - 1].type === types.LITERAL_TEXT
            ) {
                argParts[argParts.length - 1].value += tokens[cursor].value;
            } else {
                argParts.push(tokens[cursor]);
            }
            tokens.splice(cursor, 1);
            continue;
        }

        // Attempt to consume variable
        if (consumeVariable({cursor}, tokens)) {

            // append leading whitespace as literal text
            if (
                argParts.length &&
                argParts[argParts.length - 1].type === types.LITERAL_TEXT
            ) {
                argParts[argParts.length - 1].value = argParts[argParts.length - 1].value + whitespace;
            } else {
                argParts.push({
                    position,
                    value: whitespace,
                    type: types.LITERAL_TEXT
                });
            }

            argParts.push(tokens[cursor]);
            tokens.splice(cursor, 1);
            continue;
        }

        if (cursor < tokens.length) {

            let token = tokens[cursor];

            // Argument delimiter
            if (token.value === ',') {
                if (argParts.length) {
                    variableToken.args.push(argParts);
                    argParts = [];
                } else {
                    variableToken.args.push([{position, value: '', type: types.LITERAL_TEXT}]);
                }
                tokens.splice(cursor, 1);
                removeWhitespace(tokens, cursor);
                continue;
            }

            // Arguments end
            if (token.value === ']') {
                if (argParts.length) {
                    variableToken.args.push(argParts);
                    argParts = [];
                } else {
                    variableToken.args.push([{position, value: '', type: types.LITERAL_TEXT}]);
                }
                break;
            }

            // Assume anything else is to be treated as literal text
            if (
                argParts.length &&
                argParts[argParts.length - 1].type === types.LITERAL_TEXT
            ) {
                argParts[argParts.length - 1].value += token.value;
            } else {
                token.type = types.LITERAL_TEXT;
                argParts.push(token);
            }
            tokens.splice(cursor, 1);
        }
    }

    // remove closing ']'
    if (!tokens[cursor]) {
        throw new Error('Unexpected end of expression');
    }
    if (tokens[cursor].value !== ']') {
        throw new Error('expected end of variable arguments');
    }
    tokens.splice(cursor, 1);
}