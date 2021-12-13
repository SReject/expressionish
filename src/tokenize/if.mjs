import types from '../helpers/token-types.mjs';

import { ExpressionSyntaxError } from '../errors.mjs';

import tokenizeArguments from './arguments.mjs';
import tokenizeCondition from './condition.mjs';

const removeWhitespace = tokens => {
    let result = ''
    while (tokens.length && tokens[0].value === ' ') {
        result += tokens.shift().value;
    }
    return result;
}

export default function tokenizeIf(result, tokens) {
    if (
        !tokens.length ||
        tokens.length < 3 ||
        tokens[0].value !== '$' ||
        tokens[1].value !== 'if' ||
        tokens[2].value !== '['
    ) {
        return false;
    }

    const token = {
        type: types.IF_VARIABLE,
        position: tokens[0].position,
        arguments: []
    }

    // Remove "$if" from tokens list
    tokens.splice(0, 2);

    // Save opening bracket token
    const openToken = tokens.shift();
    if (openToken.value !== '[') {
        throw new ExpressionSyntaxError('$if requires atleast 2 arguments', token.position);
    }
    removeWhitespace(tokens);

    // Consume condition block and delimiter
    if (!tokenizeCondition(token.arguments, tokens)) {
        throw new ExpressionSyntaxError('$if requires the first argument to be a conditional', openToken.position + 1);
    }

    if (!tokens.length) {
        throw new ExpressionSyntaxError('unexpected end of expression');
    }
    if (tokens[0].value !== ',') {
        throw new ExpressionSyntaxError('expected comma delimiter after condition', tokens[0].position);
    }
    tokens.shift();
    removeWhitespace(tokens);

    // Re-add opening bracket token so tokenizeArguments() can be used to finish parsing the $if[]
    tokens.unshift(openToken);
    tokenizeArguments(token.arguments, tokens);

    // check result
    if (token.arguments.length < 2) {
        throw new ExpressionSyntaxError('$if requires at least 2 arguments', openToken.position);
    }
    if (token.arguments.length > 3) {
        throw new ExpressionSyntaxError('$if requires at most 3 arguments', result[result.length -1].position);
    }
    result.push(token);
    return true;
}