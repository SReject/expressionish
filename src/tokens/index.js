
const types = require('../helpers/token-types.js');

const { tokenize } = require('../helpers/split.js');

// const { tokenizeEscape, tokenizeQuote, TextToken } = require('./text.js');
const { tokenizeEscape, TextToken } = require('./text.js');
const ifHandler = require('./if.js');
const variableHandler = require('./variable.js');
const lookupHandler = require('./lookup.js');

// tokenize(expression)
module.exports = (expression, lookups) => {
    let tokens = tokenize(expression, lookups);
    const result = [];

    while (tokens.length) {

        // Attempt to consume token as escape sequence
        if (tokenizeEscape(result, tokens)) {
            continue;
        }

        // Attempt to consume token as $if
        if (ifHandler.tokenize(result, tokens, lookups)) {
            continue;
        }

        // Attempt to consume token as a variable
        if (variableHandler.tokenize(result, tokens, lookups)) {
            continue;
        }

        // Attempt to consume lookup
        if (lookupHandler.tokenize(result, tokens, lookups)) {
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