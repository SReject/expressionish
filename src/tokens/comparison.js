const types = require('../helpers/token-types.js');

const { removeWhitespace } = require('../helpers/misc.js');
const  operators = require('../operators/compare.js');

const BaseToken = require('./base.js');
const ifHandler = require('./if.js');
const variableHandler = require('./variable.js');
const lookupHandler = require('./lookup.js');
const {
    TextToken,
    tokenizeEscape,
    tokenizeQuote
} = require('./text.js');
const { evalArgsList } = require('../helpers/arg-eval.js');

class ComparisonToken extends BaseToken {

    constructor(options) {
        super({
            ...options,
            type: types.CONDITION
        });
        this.arguments = options.arguments;
    }

    async evaluate(options) {
        if (!this.value) {
            this.value = 'exists';
        }
        const operator = operators.get(this.value);

        if (operator == null) {
            return false;
        }

        const args = await evalArgsList(options, this.arguments);

        if (options.onlyValidate) {
            return false;
        }

        return operator(...args);
    }
}

// tokenizeComparison()
module.exports.tokenize = (tokens, lookups) => {

    // nothing to consume
    if (!tokens.length || tokens[0].value === ',' || tokens[0].value === ']') {
        return;
    }

    const leadingWs = removeWhitespace(tokens),
        position = tokens[0].position,
        left = [],
        right = [];

    let value;
    while (tokens.length) {
        const pos = tokens[0].position,
            ws = removeWhitespace(tokens);

        // end of condition block
        if (!tokens.length || tokens[0].value === ',' || tokens[0].value === ']') {
            break;
        }

        // consume operator: must be prefixed with whitespace and suffixed with whitespace or end-of-conditional
        if (
            value == null &&
            (leadingWs || ws) &&
            operators.has(tokens[0].value) &&
            (
                !tokens[1] ||
                tokens[1].value === ' ' ||
                tokens[1].value === ',' ||
                tokens[1].value === ']'
            )
        ) {
            value = tokens[0].value;
            tokens.shift();
            removeWhitespace(tokens);
            continue;
        }

        // consume negated operator: must be prefixed with whitespace and suffixed with whitespace or end-of-conditional
        if (
            value == null &&
            (leadingWs || ws) &&
            tokens[0].value === '!' &&
            tokens[1] &&
            operators.has('!' + tokens[1].value) &&
            (
                !tokens[2] ||
                tokens[2].value === ' ' ||
                tokens[2].value === ',' ||
                tokens[2].value === ']'
            )
        ) {
            value = '!' + tokens[1].value;
            tokens.splice(0, 2);
            removeWhitespace(tokens);
            continue;
        }

        const side = value == null ? left : right;

        // Add whitespace to side token array
        if (ws) {
            if (side.length && side[side.length - 1].type === types.TEXT) {
                side[side.length - 1].value += ws;
            } else {
                side.push(new TextToken({value: ws, position: pos}));
            }
        }

        if (tokenizeEscape(side, tokens)) {
            continue;
        }

        if (tokenizeQuote(side, tokens)) {
            continue;
        }

        if (ifHandler.tokenize(side, tokens, lookups)) {
            continue;
        }

        if (variableHandler.tokenize(side, tokens, lookups)) {
            continue;
        }
        if (lookupHandler.tokenize(side, tokens, lookups)) {
            continue;
        }

        // Treat all other tokens as plain text
        const token = tokens.shift();
        if (side.length && side[side.length - 1].type === types.TEXT) {
            side[side.length - 1].value += token.value;
        } else {
            side.push(new TextToken(token));
        }
    }

    return new ComparisonToken({
        position,
        value,
        arguments: [left, right]
    });
};

module.exports.ComparisonToken = ComparisonToken;