import types from '../helpers/token-types.mjs';

import tokenizeArguments from './arguments.mjs';

const nameCheck = /^([a-z][a-z\d]+)(.*)$/i;

export default function tokenizeVariable(result, tokens) {
    if (!tokens.length || tokens[0].value !== '$') {
        return false;
    }

    const prefixToken = tokens.shift();

    let nameMatch;

    // token is not a valid variable name: do not consume anything
    if (!tokens.length || !(nameMatch = nameCheck.exec(tokens[0].value))) {
        tokens.unshift(prefixToken);
        return false;
    }

    const token = tokens.shift();
    token.type = types.VARIABLE;

    // Trailing characters after variable name
    if (nameMatch[2] !== '') {
        tokens.unshift({
            value: nameMatch[2],
            position: token.position + nameMatch[1].length
        });
        token.value = nameMatch[1];
    }

    const args = [];
    if (tokenizeArguments(args, tokens)) {
        token.arguments = args;
    }

    result.push(token);
    return true;
};