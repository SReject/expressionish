import types from '../helpers/token-types.mjs';

const varnameMatch = /^([a-z][a-z\d]+)(.*)$/i;
export default (state, tokens) => {
    let cursor = state.cursor;
    const {value: tokenValue, position: tokenPosition } = tokens[cursor];

    if (tokenValue !== '$') {
        return;
    }

    let nextToken = tokens[cursor + 1],
        varnameResult;

    // if the next token doesn't start with a valid variable name treat the $ token as literal text
    if (nextToken == null || !(varnameResult = varnameMatch.exec(nextToken.value))) {
        tokens[cursor].type = types.LITERAL_TEXT;
        state.consumed = true;
        state.cursor += 1;
        return;
    }

    // there are characters trailing the variable name: "$varname.extra_characters"
    if (varnameResult[2] !== '') {
        const nextPosition = nextToken.position;
        // remove the varname from the extra characters, and update the token's start position
        nextToken.value = varnameResult[2];
        nextToken.position = nextPosition + varnameResult[1].length;

        // Insert a new token for the variable name
        tokens.splice(cursor + 1, 0, {
            value: varnameResult[1],
            position: nextPosition
        });
    }

    // remove the $ token
    tokens.splice(cursor, 1);

    // update the token's type to VAR_NAME
    tokens[cursor].type = types.VAR_NAME;

    // indicate the cursor has moved
    state.consumed = true;
    state.cursor += 1;
    return true;
}