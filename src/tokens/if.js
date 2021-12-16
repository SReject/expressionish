const types = require('../helpers/token-types.js');
const { removeWhitespace } = require('../helpers/misc.js');

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

        const args = [];
        if (this.arguments && this.arguments.length) {
            for (let idx = 0; idx < this.arguments.length; idx += 1) {
                let accumulator = '';
                const parts = this.arguments[idx];
                for (let partsIdx = 0; partsIdx < parts.length; partsIdx += 1) {
                    let res = await parts[partsIdx].evaluate(options);
                    if (res != null) {
                        accumulator += res;
                    }
                }
                args.push(accumulator);
            }
        }

        // Only validating: validate both arguments
        if (options.onlyValidate) {
            const args = [];
            if (this.arguments && this.arguments.length) {
                for (let idx = 0; idx < this.arguments.length; idx += 1) {
                    let accumulator = '';
                    const parts = this.arguments[idx];
                    for (let partsIdx = 0; partsIdx < parts.length; partsIdx += 1) {
                        let res = await parts[partsIdx].evaluate(options);
                        if (res != null) {
                            accumulator += res;
                        }
                    }
                    args.push(accumulator);
                }
            }
            return '';
        }

        // No arguments
        if (!this.arguments || !this.arguments.length) {
            return '';
        }

        // Evaluate conditional argument
        if (result) {
            let accumulator = '';
            const parts = this.arguments[0];
            for (let partsIdx = 0; partsIdx < parts.length; partsIdx += 1) {
                let res = await parts[partsIdx].evaluate(options);
                if (res != null) {
                    accumulator += res;
                }
            }
            return accumulator;

        } else if (this.arguments[1] == null) {
            return '';

        } else {
            let accumulator = '';
            const parts = this.arguments[1];
            for (let partsIdx = 0; partsIdx < parts.length; partsIdx += 1) {
                let res = await parts[partsIdx].evaluate(options);
                if (res != null) {
                    accumulator += res;
                }
            }
            return accumulator;
        }
    }
}

// tokenizeIf();
module.exports.tokenize = (output, tokens) => {

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
    let condition = logicOperatorHandler.tokenize(tokens);
    if (!condition) {

        // Attempt to consume comparison condition
        condition = comparisonHandler.tokenize(tokens);
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
    argumentsHandler.tokenize(args, tokens);

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