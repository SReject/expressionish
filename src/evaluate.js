const {
    ExpressionError,
    ExpressionSyntaxError,
    ExpressionVariableError,
    ExpressionArgumentsError
} = require('./errors.js');

const tokenTypes = require('./helpers/token-types.js');

const tokenize = require('./tokens/index.js');

/**
** @param {object} options
** @param {Map<string, object>} options.handlers
** @param {function} options.lookup
** @param {string} options.expression
** @param {object} options.metadata
** @param {!any} options.trigger
** @param {function} options.postProcessVariable
*/
async function evaluate(options) {

    if (options == null) {
        throw new TypeError('options not specified');
    }

    // validate handlers list
    if (options.handlers == null) {
        throw new TypeError('handlers list null');
    }
    if (!(options.handlers instanceof Map)) {
        throw new TypeError('handlers list is not a Map');
    }

    if (options.lookups == null) {
        options.lookups = new Map();

    } else if (!(options.lookups instanceof Map)) {
        throw new TypeError('lookup list is not a map');
    }

    // Validate expression
    if (options.expression == null) {
        throw new TypeError('expression not specified');
    }
    if (typeof options.expression !== 'string') {
        throw new TypeError('expression must be a string');
    }
    if (options.postProcessVariable && typeof options.postProcessVariable !== 'function') {
        throw new TypeError('post processor must be a function');
    }

    // tokenize expression
    const tokens = tokenize(options.expression, [ ...options.lookups.keys() ]);

    // evaluate
    const result = [];
    for (let idx = 0; idx < tokens.length; idx += 1) {
        const tokenType = tokens[idx].type
        let token = await tokens[idx].evaluate(options);

        if (options.postProcessVariable && (
            tokenType === tokenTypes.IF ||
            tokenType === tokenTypes.LOOKUP ||
            tokenType === tokenTypes.VARIABLE
        )) {
            const post = await options.postProcessVariable(token);
            if (post !== undefined) {
                token = post;
            }
        }
        if (token == null) {
            result.push('');

        } else if (typeof token === 'string') {
            result.push(token);

        } else {
            result.push(JSON.stringify(token));
        }
    }

    // return result
    return result.join('');
}

module.exports = evaluate;
module.exports.ExpressionError = ExpressionError;
module.exports.ExpressionSyntaxError = ExpressionSyntaxError;
module.exports.ExpressionVariableError = ExpressionVariableError;
module.exports.ExpressionArgumentsError = ExpressionArgumentsError;