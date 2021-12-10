import types from '../helpers/token-types.mjs';

export default (state, tokens, escapeChars) => {
    let cursor = state.cursor;
    const { value: tokenValue } = tokens[cursor];

    if (tokenValue !== '\\') {
        return;
    }

    if (tokens[cursor + 1] == null) {
        tokens[cursor].type = types.LITERAL_TEXT;
        state.consumed = true;
        state.cursor += 1;
        return;
    }

    // Retrieve the token following the escape token
    let {value: nextTokenValue, nextTokenPosition} = tokens[cursor + 1];

    // if the following token is more than one character long
    if (nextTokenValue.length > 1) {

        // remove first character from next token
        tokens[cursor + 1] = {
            position: nextTokenPosition + 1,
            value: nextTokenValue.slice(1)
        };

        // Insert the removed character as its own token following the \'s token
        tokens.splice(cursor + 1, 0, {
            position: nextTokenPosition,
            value: nextTokenValue[0]
        });

        // update nextToken related vars to point to inserted token
        nextTokenValue = nextTokenValue[0];
    }

    // character isn't escapable so treat the \ as literal text
    if (escapeChars.indexOf(nextTokenValue) === -1) {
        tokens[cursor].type = types.LITERAL_TEXT;
        state.consumed = true;
        state.cursor += 1;
        return;
    }

    // character is escapeable so remove the \ from the tokens list and add set the next token as being literal_text
    tokens.splice(cursor, 1);
    tokens[cursor].type = types.LITERAL_TEXT;
    state.consumed = true;
    state.cursor += 1;
};