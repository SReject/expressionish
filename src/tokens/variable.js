const { ExpressionVariableError, ExpressionArgumentsError } = require('../errors.js');

const types = require('../helpers/token-types.js');
const { evalArgsList } = require('../helpers/arg-eval.js');

const BaseToken = require('./base.js');
const argumentsHandler = require('./arguments.js');

const nameCheck = /^([a-z][a-z\d]+)([\s\S]*)$/i;

class VariableToken extends BaseToken {
    constructor(options) {
        super({
            ...options,
            type: types.VARIABLE
        });
        this.arguments = options.arguments;
    }

    async evaluate(options = {}) {
        if (!options.handlers || !options.handlers.has(this.value)) {
            throw new ExpressionVariableError(`unknown variable`, this.position, this.value);
        }

        const variable = options.handlers.get(this.value);

        if (options.preeval) {
            await options.preeval(options, variable);
        }
        if (variable.preeval) {
            await variable.preeval(options, variable);
        }

        const args = await evalArgsList(options, this.arguments);

        if (options.onlyValidate) {
            return '';
        }

        try {
            if (variable.argsCheck) {
                await variable.argsCheck(...args);
            }
        } catch (err) {
            throw new ExpressionArgumentsError(err.message, err.position, err.index);
        }
        const result = await variable.evaluator(options.metadata || {}, ...args);
        return result == null ? '' : result;
    }
}

// tokenizeVariable()
module.exports.tokenize = (output, tokens, lookups) => {

    let nameMatch;
    if (
        tokens.length < 2 ||
        tokens[0].value !== '$' ||
        !(nameMatch = nameCheck.exec(tokens[1].value))
    ) {
        return false;
    }
    tokens.shift();

    const token = tokens.shift();

    // trailing character after variable name
    if (nameMatch[2] !== '') {
        tokens.unshift({
            value: nameMatch[2],
            position: token.position + nameMatch[1].length
        });
        token.value = nameMatch[1];
    }

    const args = [];
    if (argumentsHandler.tokenize(args, tokens, lookups)) {
        token.arguments = args;
    }

    output.push(new VariableToken(token))
    return true;
};
module.exports.VariableToken = VariableToken;