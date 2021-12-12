import types from '../helpers/token-types.mjs';

import { tokenize as splitExpression } from '../helpers/split.mjs';

import tokenizeEscape from './escape.mjs';
import tokenizeQuotedText from './quoted-text.mjs';
import tokenizeIf from './if.mjs';
import tokenizeVariable from './variable.mjs';


const ESC_CHARS = '"$[\\';

export default function tokenize(expression) {
    let tokens = splitExpression(expression);

    const result = [];

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

        // Attempt to consume token as escape sequence
        if (tokenizeEscape(result, tokens, ESC_CHARS)) {
            continue;
        }

        // Attempt to consume token as quoted text
        if (tokenizeQuotedText(result, tokens)) {
            continue;
        }

        // Attempt to consume token as $if
        if (tokenizeIf(result, tokens)) {
            continue;
        }

        // Attempt to consume token as a variable
        if (tokenizeVariable(result, tokens)) {
            continue;
        }

        // Assume token is literal text
        let token = tokens.shift(),
            resLen = result.length;
        if (resLen.length && result[resLen - 1].type === types.LITERAL_TEXT) {
            result[resLen - 1].value += token.value;

        } else {
            token.type = types.LITERAL_TEXT;
            result.push(token);
        }
    }
    return tokens;
}