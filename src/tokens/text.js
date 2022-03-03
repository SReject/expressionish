const { ExpressionSyntaxError } = require('../errors.js');
const types = require('../helpers/token-types.js');

const BaseToken = require('./base.js');

class TextToken extends BaseToken {
    constructor(options) {
        super({
            ...options,
            type: types.TEXT
        });
    }
}

const tokenizeEscape = (output, tokens, escape) => {
    if (!tokens.length || tokens[0].value !== '\\') {
        return false;
    }

    if (escape == null) {
        escape = '"$[\\rnt';
    }

    // get escape denoter character(\)
    let token = tokens.shift();

    // Denoter followed by non-escapable character - Treat as plain text
    if (
        tokens[0] == null ||
        escape.indexOf(tokens[0].value[0]) === -1
    ) {
        if (output[1] != null && output[output.length - 1].type === types.TEXT) {
            output[output.length - 1].value += token.value;
        } else {
            output.push(new TextToken(token));
        }
        return true;
    }

    // Get escaped token
    token = tokens.shift();

    // Escaped token contains more than one character
    // split escaped character from remaining token text
    if (token.length > 1) {
        tokens.unshift({
            position: token.position,
            value: token.value.slice(1)
        });
        token.value = token.value[0];
    }

    // If token is special-character-sequence
    // replace sequence with represented value
    if (token.value === 'n') {
        token.value = '\n';
    } else if (token.value === 'r') {
        token.value = '\r';
    } else if (token.value === 't') {
        token.value = '\t';
    }

    // If the last token of the output is text, append the token value to the text
    if (output.length && output[output.length - 1].type === types.TEXT) {
        output[output.length - 1].value += token.value;

    // Otherwise add a new text token to the output
    } else {
        output.push(new TextToken(token));
    }
    return true;
};

const tokenizeQuote = (output, tokens) => {
    if (!tokens.length || tokens[0].value !== '"') {
        return false;
    }

    const openToken = tokens.shift();

    let text = [];
    while (tokens.length) {
        if (tokens[0].value === '"') {
            tokens.shift();
            text = text.map(item => item.value).join('');

            if (output.length && output[output.length - 1].type === types.TEXT) {
                output[output.length - 1].value += text;

            } else {
                output.push(new TextToken({
                    position: openToken.position + 1,
                    value: text
                }));
            }
            return true;
        }

        if (tokenizeEscape(text, tokens, '\\"nrt')) {
            continue;
        }

        text.push(tokens.shift());
    }

    // End quote wasn't encountered in the loop
    throw new ExpressionSyntaxError('end quote missing', openToken.position);
};

module.exports = {
    tokenizeEscape,
    tokenizeQuote,
    TextToken
};