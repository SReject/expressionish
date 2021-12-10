import types from './helpers/token-types.mjs';
import { tokenize } from './helpers/split.mjs';


import consumeEscapeSequence from './consume/escape.mjs';
import consumeQuotedText from './consume/quoted-text.mjs';
import consumeVariable from './consume/variable.mjs';

// Root level escape characters
const ESC_CHARS = '"$[\\';

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

    /*
    FIRST PASS:
    - Split expression into characters
    - Merge characters of no significance into single entry
    - Convert entries into tokens of: {position, value}
    */
    let tokens = tokenize(options.expression);

    /*
    SECOND PASS:
    - Process escape sequences into LITERAL_TEXT entities
    - Process quoted text sequences into LITERAL_TEXT entities
    - Process variables into respective entities
    - Process non-significant tokens into LITERAL_TEXT entites
    - Concatinate sequential LITERAL_TEXT tokens into single token
    */
    let cursor = 0;
    while (cursor < tokens.length) {

        let state = {cursor};

        // Attempt to consume token as escape sequence
        if (consumeEscapeSequence(state, tokens, ESC_CHARS)) {
            if (cursor > 0 && tokens[cursor - 1].type === types.LITERAL_TEXT) {
                tokens[cursor - 1].value += tokens[cursor].value;
                tokens.splice(cursor, 1);
            } else {
                cursor = state.cursor;
            }
            continue;
        }

        // Attempt to consume token as quoted text
        if (consumeQuotedText(state, tokens)) {
            if (cursor > 0 && tokens[cursor - 1].type === types.LITERAL_TEXT) {
                tokens[cursor - 1].value += tokens[cursor].value;
                tokens.splice(cursor, 1);
            } else {
                cursor = state.cursor;
            }
            continue;
        }

        // Attempt to consume token as a variable
        if (consumeVariable(state, tokens)) {
            cursor = state.cursor;
            continue;
        }

        // Assume token is literal text
        if (cursor > 0 && tokens[cursor - 1].type === types.LITERAL_TEXT) {
            tokens[cursor - 1].value += tokens[cursor].value;
            tokens.splice(cursor, 1);
        } else {
            tokens[cursor].type = types.LITERAL_TEXT;
            cursor += 1;
        }
    }

    /*

    // Concatinate all literal text tokens
    return tokens.reduce((acc, cur) => {
        if (cur.type !== types.LITERAL_TEXT) {
            throw new Error('failed to fully evaluate expression');
        }
        return acc + cur.value;
    }, '');

    */
    return tokens;
}