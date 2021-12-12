import {ExpressionError, ExpressionSyntaxError, ExpressionVariableError, ExpressionArgumentsError } from './errors.mjs';

import tokenize from './tokenize/tokenize.mjs';
import evaluateExpression from './evaluate/expression.mjs';

function evaluate(handlers, options) {

    // validate handlers list
    if (handlers == null) {
        throw new TypeError('handlers list null');
    }

    if (typeof handlers !== 'object') {
        throw new TypeError('handlers list is not an array or object');
    }

    // validate options.expression
    if (options == null) {
        throw new TypeError('options not specified');
    }

    // validate options.trigger
    if (options.trigger == null) {
        throw new TypeError('No trigger defined in options');
    }

    // Validate expression
    if (options.expression == null) {
        throw new TypeError('expression not specified');
    }
    if (typeof options.expression !== 'string') {
        throw new TypeError('expression must be a string');
    }

    // Convert handlers array to map
    if (Array.isArray(handlers)) {
        const res = new Map();
        handlers.forEach(item => res.set(item.handle, item));
        handlers = res;

    // Convert object literal to map
    } else if (!(handlers instanceof Map)) {
        const res = new Map();
        Object.keys(handlers).forEach(key => {
            res.set(key, handlers[key]);
        });
    }

    if (!(handlers instanceof Map)) {
        throw new TypeError('failed to convert handlers to Map');
    }

    const tokens = tokenize(options.expression);
    return evaluateExpression(handlers, options, tokens);
};

export {
    evaluate as default,
    ExpressionError,
    ExpressionSyntaxError,
    ExpressionVariableError,
    ExpressionArgumentsError
};