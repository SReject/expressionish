const { ExpressionVariableError, ExpressionArgumentsError } = require('../errors.js');

const types = require('../helpers/token-types.js');
const { evalArgsList } = require('../helpers/arg-eval.js');

const BaseToken = require('./base.js');
const argumentsHandler = require('./arguments.js');

const nameCheck = /^([a-z][a-z\d._-]+)([\s\S]*)$/i;

class LookupToken extends BaseToken {
    constructor(options) {
        super({
            ...options,
            type: types.LOOKUP
        });
        this.arguments = options.arguments;
        this.prefix = options.prefix
    }

    async evaluate(options = {}) {
        if (!options.lookups || !options.lookups.has(options, this.prefix, this.value)) {
            throw new ExpressionVariableError(`unknown lookup`, this.position, this.value);
        }
        const lookupHandler = options.lookups.get(options, this.prefix);
        const variable = lookupHandler(this.value);
        if (variable == null) {
            return '';
        }

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
module.exports.tokenize = (output, tokens, lookup) => {

    let nameMatch;
    if (
        tokens.length < 2 ||
        tokens[0].value !== '$' ||
        tokens[1].value == null ||
        !lookup.includes(tokens[1].value) ||
        !(nameMatch = nameCheck.exec(tokens[2].value))
    ) {
        return false;
    }
    tokens.shift();

    const token = tokens.shift();
    token.prefix = tokens.shift();

    // trailing character after variable name
    if (nameMatch[2] !== '') {
        tokens.unshift({
            value: nameMatch[2],
            position: token.position + nameMatch[1].length
        });
        token.value = nameMatch[1];
    }

    const args = [];
    if (argumentsHandler.tokenize(args, tokens, lookup)) {
        token.arguments = args;
    }

    output.push(new LookupToken(token));
    console.log('Tokenized lookup token', token);
    return true;
};
module.exports.LookupToken = LookupToken;