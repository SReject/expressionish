import operators from './operators.mjs';

import tokenize from './helpers/tokenize.mjs';
import { has } from './helpers/misc.mjs';
import types from './helpers/token-types.mjs';

import consumeEscapeSequence from './consume/escape.mjs';
import consumeQuotedText from './consume/quoted-text.mjs';
import consumeVariableName from './consume/variable-name.mjs';

// characters that can be escaped outside of quoted text
const ESC_CHARS = '$",[]\\';

export default function evaluate(variables, options) {

    // validate handlers list
    if (!Array.isArray(variables)) {
        throw new TypeError('handlers list not an array');
    }

    // validate options.expression
    if (options == null) {
        throw new TypeError('options not specified');
    }
    if (options.expression == null) {
        throw new TypeError('expression not specified');
    }
    if (typeof options.expression !== 'string') {
        throw new TypeError('expression must be a string');
    }

    // validate options.trigger
    if (options.trigger == null) {
        throw new TypeError('No trigger defined in options');
    }

    let tokens = tokenize(options.expression).map((function (value) {
        const position = this.position;
        this.position += value.length;
        return { value, position };
    }).bind({ position: 0 }));

    /*
    FIRST PASS:
    - Process escape sequences into LITERAL_TEXT entities
    - Process quoted text sequences into LITERAL_TEXT entities
    - Process non-significant tokens into LITERAL_TEXT entites
    - Concatinate sequential LITERAL_TEXT tokens into single token
    - process $varname sequences into VARNAME entities
    */
    let cursor = 0;
    while (cursor < tokens.length) {

        const token = tokens[cursor];

        // Potential Operator
        if (has(operators, token.value) || token.value === '!') {
            token.type = types.OPERATOR;
            cursor += 1;
            continue;
        }

        // Non-signifacant token
        if (tokens[cursor].value === '' || '"$\\[,]'.indexOf(tokens[cursor].value) === -1) {
            if (cursor > 0 && tokens[cursor - 1].type === types.LITERAL_TEXT) {
                tokens[cursor - 1].value += tokens[cursor].value;
                tokens.splice(cursor, 1);
            } else {
                tokens[cursor].type = types.LITERAL_TEXT;
                cursor += 1;
            }
            continue;
        }

        const state = {cursor, consumed: false};

        // Process next token as escape sequence
        consumeEscapeSequence(state, tokens, ESC_CHARS);
        if (state.consumed) {
            if (cursor > 0 && tokens[cursor - 1].type === types.LITERAL_TEXT) {
                tokens[cursor - 1].value += tokens[cursor].value;
                tokens.splice(cursor, 1);
            } else {
                cursor = state.cursor;
            }
            continue;
        }

        // Process next token as quoted text
        consumeQuotedText(state, tokens);
        if (state.consumed) {
            if (cursor > 0 && tokens[cursor - 1].type === types.LITERAL_TEXT) {
                tokens[cursor - 1].value += tokens[cursor].value;
                tokens.splice(cursor, 1);
            } else {
                cursor = state.cursor;
            }
            continue;
        }

        // process next token as a variable name
        consumeVariableName(state, tokens);
        if (state.consumed) {
            cursor = state.cursor;
            continue;
        }

        // Move cursor to next token
        cursor += 1;
    }

    // Concatinate all literal text tokens
    return tokens.reduce((acc, cur) => {
        if (cur.type !== types.LITERAL_TEXT) {
            throw new Error('failed to fully evaluate expression');
        }
        return acc + cur.value;
    }, '');

    return tokens;
}