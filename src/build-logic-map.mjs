import types from './helpers/token-types.mjs';
import { tokenize } from './helpers/split.mjs';


import consumeEscapeSequence from './consume/escape.mjs';
import consumeQuotedText from './consume/quoted-text.mjs';
import consumeVariable from './consume/variable.mjs';

// Root level escape characters
const ESC_CHARS = '"$[\\';

export default function buildLogicMap(expression) {

    /*
    FIRST PASS - Tokenization
    - Split expression into characters
    - Merge characters of no significance into single entry
    - Convert entries into tokens of: {position, value}
    */
    let tokens = tokenize(expression);

    /*
    SECOND PASS - Build logic tree
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
    return tokens;
}