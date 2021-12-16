const types = require('../helpers/token-types.js');

const { ExpressionSyntaxError } = require('../errors.js');
const { removeWhitespace } = require('../helpers/misc.js');

const BaseToken = require('./base.js');
const comparisonHandler = require('./comparison.js');

const operators = require('../operators/logical.js');

class LogicToken extends BaseToken {
    constructor(options) {
        super({
            ...options,
            type: types.LOGICAL
        });
        this.arguments = options.arguments;
    }

    async evaluate(options = {}) {
        let operator = operators.get(this.value);
        if (!operator) {
            return false;
        }

        let args = [];
        for (let idx = 0; idx < this.arguments.length; idx += 1) {
            let arg = await this.arguments[idx].evaluate(options);
            args.push(arg);
        }

        if (options.onlyValidate) {
            return false;
        }
        return operator(...args);
    }
}

// tokenizeLogicOperator()
const tokenize = tokens => {
    // Not a logical operator
    if (
        tokens.length < 4 ||
        tokens[0].value !== '$' ||
        !operators.has('$' + tokens[1].value) ||
        tokens[2].value !== '['
    ) {
        return;
    }


    // setup result token
    const result = {
        position: tokens[0].position,
        value: '$' + tokens[1].value,
        arguments: []
    }

    // Remove opening tokens: $ operator [
    tokens.splice(0, 3);

    while (tokens.length) {

        // Trim leading whitespace
        removeWhitespace(tokens);
        if (!tokens.length) {
            break;
        }

        // store start position
        let position = tokens[0].position;

        // Consume condition and trailing whitespace
        let token = tokenize(tokens);
        if (token == null) {
            token = comparisonHandler.tokenize(tokens);
            if (token == null) {
                throw new ExpressionSyntaxError('condition expected', position);
            }
        }
        result.arguments.push(token);
        removeWhitespace(tokens);
        if (!tokens.length) {
            break;
        }

        // Argument delimiter
        if (tokens[0].value === ',') {
            tokens.shift();
            continue;
        }

        // End of Logic Block
        if (tokens[0].value === ']') {
            tokens.shift();
            removeWhitespace(tokens);
            return new LogicToken(result);
        }
    }

    throw new ExpressionSyntaxError('unexpected end of expression');
};
module.exports.tokenize = tokenize;
module.exports.LogicToken = LogicToken;