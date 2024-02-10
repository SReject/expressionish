const types = require('../helpers/token-types.js');

const { removeWhitespace } = require('../helpers/misc.js');
const { evalArgsList, evalArg } = require('../helpers/arg-eval.js');

const { ExpressionSyntaxError } = require('../errors.js');

const BaseToken = require('./base.js');
const comparisonHandler = require('./comparison.js');
const logicOperatorHandler = require('./logic-operator.js');
const argumentsHandler = require('./arguments.js');

class IfToken extends BaseToken {
    constructor(options) {
        super({
            type: types.IF,
            ...options
        });
        this.condition = options.condition;
        this.arguments = options.arguments;
    }

    async evaluate(options = {}) {
        let result = await this.condition.evaluate(options);

        // Only validating: validate both arguments
        if (options.onlyValidate) {
            await evalArgsList(options, this.arguments);
            return '';
        }

        // No arguments
        if (!this.arguments || !this.arguments.length) {
            return '';
        }

        // Evaluate conditional argument
        if (result) {
            return await evalArg(options, this.arguments[0]);
        }
        if (this.arguments[1] == null) {
            return '';
        }
        return await evalArg(options, this.arguments[1]);
    }
}

// tokenizeIf();
module.exports.tokenize = (output, tokens, lookups) => {

    // not an $if[ token
    if (
        !tokens.length ||
        tokens.length < 2 ||
        tokens[0].value !== '$' ||
        tokens[1].value !== 'if'
    ) {
        return false;
    }

    if (!tokens[2] || tokens[2].value !== '[') {
        throw new ExpressionSyntaxError('$if requires atleast 2 arguments', tokens[1].position);
    }

    const position = tokens[0].position;
    const args = [];

    // remove opening tokens
    tokens.splice(0, 2);

    // Save opening bracket token
    const openToken = tokens.shift();

    // Attempt to consume logic condition
    let condition = logicOperatorHandler.tokenize(tokens, lookups);
    if (!condition) {

        // Attempt to consume comparison condition
        condition = comparisonHandler.tokenize(tokens, lookups);
        if (!condition) {
            throw new ExpressionSyntaxError('$if requires the first argument to be a conditional', openToken.position + 1);
        }
    }

    // Comsume delimiter(,) following condition
    if (!tokens.length) {
        throw new ExpressionSyntaxError('unexpected end of expression');
    }
    if (tokens[0].value !== ',') {
        throw new ExpressionSyntaxError('expected comma delimiter after condition', tokens[0].position);
    }
    tokens.shift();
    removeWhitespace(tokens);

    // Re-add opening bracket token so tokenizeArguments() can be used to finish parsing the $if[]
    tokens.unshift(openToken);
    argumentsHandler.tokenize(args, tokens, lookups);

    // check result
    if (args.length < 1) {
        throw new ExpressionSyntaxError('$if requires at least 2 arguments', openToken.position);
    }
    if (args.length > 2) {
        throw new ExpressionSyntaxError('$if requires at most 3 arguments', args[3].position);
    }

    output.push(new IfToken({
        position,
        condition,
        arguments: args
    }));
    return true;
};

module.exports.IfToken = IfToken;