import types from '../helpers/token-types.mjs';

import tokenizeEscape from './escape.mjs';
import tokenizeQuotedText from './quoted-text.mjs';
import tokenizeIf from './if.mjs';
import tokenizeVariable from './variable.mjs';

import comparisonOperators from '../operators/compare.mjs';
import logicOperators from '../operators/logical.mjs';

const removeWhitespace = tokens => {
    let result = '';
    while (tokens.length && tokens[0].value === ' ') {
        result += tokens.shift().value;
    }
    return result;
}

const tokenizeComparison = tokens => {

    // nothing to consume
    if (!tokens.length || tokens[0].value === ',' || tokens[0].value === ']') {
        return;
    }

    const token = {
        type: types.CONDITION,
        value: null
    }

    let left = [], right = [];

    while (tokens.length) {
        let position = tokens[0].position,
            whitespace = removeWhitespace(tokens);

        // end of condition block
        if (!tokens.length || tokens[0].value === ',' || tokens[0].value === ']') {
            break;
        }

        // consume operator: must be prefixed with whitespace and suffixed with whitespace or end-of-conditional
        if (
            token.value == null &&
            whitespace &&
            comparisonOperators.has(tokens[0].value) &&
            (
                !tokens[1] ||
                tokens[1].value === ' ' ||
                tokens[1].value === ',' ||
                tokens[1].value === ']'
            )
        ) {
            token.value = tokens[0].value;
            tokens.shift();
            removeWhitespace(tokens);
            continue;
        }

        // Select the side being consumed
        const side = token.value == null ? left : right;

        // Add whitespace to side token array
        if (whitespace) {
            if (side.length && side[side.length - 1].type === types.LITERAL_TEXT) {
                side[side.length - 1].value += whitespace;
            } else {
                side.push({value: whitespace, type: types.LITERAL_TEXT, position});
            }
        }

        if (tokenizeEscape(side, tokens)) {
            continue;
        }

        if (tokenizeQuotedText(side, tokens)) {
            continue;
        }

        if (tokenizeIf(side, tokens)) {
            continue;
        }

        if (tokenizeVariable(side, tokens)) {
            continue;
        }

        // Treat all other tokens as plain text
        const textToken = tokens.shift();
        if (side.length && side[side.length - 1].type === types.LITERAL_TEXT) {
            side[side.length - 1].value += textToken.value;
        } else {
            textToken.type = types.LITERAL_TEXT;
            side.push(textToken);
        }
    }

    // default to exists
    if (token.value == null) {
        token.value = 'exists';
    }
    token.arguments = [left, right];

    return token;
};

const tokenizeLogicOperator = tokens => {

    // Not a logical operator
    if (
        tokens.length < 4 ||
        tokens[0].value !== '$' ||
        !logicOperators.has('$' + tokens[1].value) ||
        tokens[2].value !== '['
    ) {
        return;
    }

    // setup result token
    const token = {
        type: types.LOGICAL,
        position: tokens[0].position,
        value: '$' + tokens[1].value,
        arguments: []
    }

    // remove opening tokens: $operator[
    tokens.splice(0, 3);

    while (tokens.length) {
        removeWhitespace(tokens);

        let condToken = tokenizeLogicOperator(tokens);
        if (condToken == null) {
            condToken = tokenizeComparison(tokens);
            if (condToken == null) {
                throw new Error('expected condition')
            }
        }
        token.arguments.push(condToken);

        removeWhitespace(tokens);
        if (!tokens.length) {
            break;
        }

        if (tokens[0].value === ']') {
            tokens.shift();
            removeWhitespace(tokens);
            return token;
        }

        if (tokens[0] === ',') {
            tokens.shift();
        }
    }

    throw new Error('unexpected end of expression');
}

export default function tokenizeCondition(result, tokens) {
    let token = tokenizeLogicOperator(tokens);
    if (token == null) {
        token = tokenizeComparison(tokens);
        if (token == null) {
            return false;
        }
    }

    result.push(token);
    return true;
}