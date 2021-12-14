import types from '../helpers/token-types.mjs';

import { tokenize } from '../helpers/split.mjs';

import { tokenizeEscape, tokenizeQuote, TextToken } from './text.mjs';
import { default as tokenizeIf } from './if.mjs';
import { default as tokenizeVariable } from './variable.mjs';

// tokenize(expression)
export default expression => {
    let tokens = tokenize(expression);
    const result = [];

    while (tokens.length) {

        // Attempt to consume token as escape sequence
        if (tokenizeEscape(result, tokens)) {
            continue;
        }

        // Attempt to consume token as quoted text
        if (tokenizeQuote(result, tokens)) {
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

        if (result.length && result[result.length - 1].type === types.TEXT) {
            result[result.length - 1].value += token.value;

        } else {
            result.push(new TextToken(token));
        }
    }
    return result;
}