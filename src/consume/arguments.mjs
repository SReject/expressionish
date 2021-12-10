import consumeCondition from './condition.mjs';

const removeWhitespace = (tokens, cursor) => {
    while (tokens[cursor] && tokens[cursor].value === ' ') {
        tokens.splice(cursor, 1);
    }
}

const consumeComma = (tokens, cursor) => {
    removeWhitespace(tokens, cursor);
    if (!tokens[cursor] || tokens[cursor].value !== ',') {
        return false;
    }
    tokens.splice(tokens, cursor);
    removeWhitespace(tokens, cursor);
    return true;
}

export default (argState, tokens) => {
    const variableToken = argState.token;

    let cursor = argState.cursor;

    let token = tokens[cursor];
    if (!token || token.value !== '[') {
        return;
    }

    // remove the opening bracket and trailing whitespace from tokens list
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

        // Attempt to consume a trailing comma
        if (!consumeComma(tokens, cursor)) {
            throw new Error('Expected arguments delimiter');
        }
    }


    // todo: consume arguments body


    // remove closing ']'
    removeWhitespace(tokens, cursor);
    if (!tokens[cursor]) {
        throw new Error('Unexpected end of expression');
    }
    if (tokens[cursor].value !== ']') {
        throw new Error('expected end of variable arguments');
    }
    tokens.splice(cursor, 1);
}