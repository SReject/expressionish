
const types = require('../helpers/token-types.js');

const { tokenize } = require('../helpers/split.js');

// const { tokenizeEscape, tokenizeQuote, TextToken } = require('./text.js');
const { tokenizeEscape, TextToken } = require('./text.js');
const ifHandler = require('./if.js');
const variableHandler = require('./variable.js');

// tokenize(expression)
module.exports = expression => {
    let tokens = tokenize(expression);
    const result = [];

    while (tokens.length) {

        // Attempt to consume token as escape sequence
        if (tokenizeEscape(result, tokens)) {
            continue;
        }

        /*

        // Attempt to consume token as quoted text
        if (tokenizeQuote(result, tokens)) {
            continue;
        }
        */

        // Attempt to consume token as $if
        if (ifHandler.tokenize(result, tokens)) {
            continue;
        }

        // Attempt to consume token as a variable
        if (variableHandler.tokenize(result, tokens)) {
            continue;
        }

        // Assume token is literal text
        let token = tokens.shift();

        if (result.length && result[result.length - 1].type === types.TEXT) {
            result[result.length - 1].value += token.value;

        } else {
            result.push(new TextToken(token));
        }
    }
    return result;
};