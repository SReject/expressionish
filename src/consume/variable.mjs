import types from '../helpers/token-types.mjs';

const varnameMatch = /^([a-z][a-z\d]+)(.*)$/i;
export default (state, tokens) => {
    let cursor = state.cursor;
    const { value: tokenValue } = tokens[cursor];

    if (tokenValue !== '$') {
        return false;
    }

    let nextToken = tokens[cursor + 1],
        varnameResult;

    // if the next token doesn't start with a valid variable name don't consume anything
    if (nextToken == null || !(varnameResult = varnameMatch.exec(nextToken.value))) {
        return false;
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
    tokens[cursor].type = types.VARIABLE;

    const argState = {token: tokens[cursor], isIf: tokens[cursor].value === 'if', cursor: state.cursor};

    // Update cursor to passed the variable name
    state.cursor += 1;

    // Attempt to consume following tokens as arguments block
    consumeArguments(argState, tokens);

    return true;
}