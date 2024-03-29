const types = require('../helpers/token-types.js');

const { removeWhitespace } = require('../helpers/misc.js');


const { ExpressionSyntaxError } = require('../errors.js');
const { tokenizeEscape, tokenizeQuote, TextToken } = require('./text.js');
const blockEscapeHandler = require('./block-escape.js');

const ifHandler = require('./if.js');
const varHandler = require('./variable.js');
const lookupHandler = require('./lookup.js');

// tokenizeArguments();
module.exports.tokenize = (output, tokens, lookups) => {
    if (!tokens.length || tokens[0].value !== '[') {
        return false;
    }

    const openToken = tokens.shift();
    removeWhitespace(tokens);

    let parts = [];
    while (tokens.length) {
        let position = tokens[0].position,
            whitespace = removeWhitespace(tokens);

        // End of arguments list
        if (tokens[0].value === ']') {
            tokens.shift();
            if (!parts.length) {
                parts = [new TextToken({position, value: ''})]
            }
            output.push(parts);
            return true;
        }

        // End of argument
        if (tokens[0].value === ',') {
            tokens.shift();
            removeWhitespace(tokens);
            if (!parts.length) {
                parts = [new TextToken({position, value: ''})];
            }
            output.push(parts);
            parts = [];
            continue;
        }

        if (blockEscapeHandler.tokenize(parts, tokens, lookups)) {
            continue;
        }

        // Add whitespace to argument part's list
        if (whitespace) {
            if (parts.length && parts[parts.length - 1].type === types.TEXT) {
                parts[parts.length - 1].value += whitespace;

            } else {
                parts.push(new TextToken({position, value: whitespace}));
            }
        }

        // Consume tokens
        if (tokenizeEscape(parts, tokens, '"$,\\]')) {
            continue;
        }

        if (tokenizeQuote(parts, tokens)) {
            continue;
        }

        if (ifHandler.tokenize(parts, tokens, lookups)) {
            continue;
        }

        if (varHandler.tokenize(parts, tokens, lookups)) {
            continue;
        }

        if (lookupHandler.tokenize(parts, tokens, lookups)) {
            continue;
        }

        // Consume all other tokens as text
        const token = tokens.shift();
        if (parts.length && parts[parts.length - 1].type === types.TEXT) {
            parts[parts.length - 1].value += token.value;
        } else {
            parts.push(new TextToken(token));
        }
    }


    if (!tokens.length) {
        throw new ExpressionSyntaxError('Unexpected end of expression', openToken.position);
    }
    throw new ExpressionSyntaxError('expected end of variable arguments', openToken.position);
};