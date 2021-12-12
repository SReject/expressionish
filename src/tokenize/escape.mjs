import types from '../helpers/token-types.mjs';

const ROOT_ESC = '"$[\\';

const resultAdd = (result, token) => {
    if (result.length && result[result.length - 1].type === types.LITERAL_TEXT) {
        result[result.length - 1].value = token.value;
    } else {
        result.push(token);
    }
};

export default function tokenizeEscape(result, tokens, escapeChars) {
    if (!tokens.length || tokens[0].value !== '\\') {
        return;
    }

    if (escapeChars == null || escapeChars === '') {
        escapeChars = ROOT_ESC;
    }

    let token = tokens.shift();

    // No escape character or escape character is not escapable
    if (tokens[1] == null || escapeChars.indexOf(tokens[1].value[0]) === -1) {
        token.type = types.LITERAL_TEXT;
        resultAdd(result, token);
        return true;
    }

    // Get escaped character
    token = tokens.shift();
    if (token.length > 1) {
        const nextToken = {
            position: token.position + 1,
            value: token.slice(1)
        }
        tokens.unshift(nextToken);

        token.value = token.value[0];
    }

    // Add the escaped character to the result
    token.type = types.LITERAL_TEXT;
    resultAdd(result, token);
    return true;
};