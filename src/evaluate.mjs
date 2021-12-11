import {ExpressionSyntaxError, ExpressionVariableError, ExpressionArgumentsError } from './errors.mjs';

import buildLogicMap from './build-logic-map.mjs';

import types from './helpers/token-types.mjs';

const processTokens = async (handlers, options, tokenMap) => {
    const result = [];

    for (let idx = 0; idx < tokenMap.length; idx += 1) {
        const item = tokenMap[idx];

        // unwrap literal text entities
        if (item.type === types.LITERAL_TEXT) {
            result.push(item.value);
            continue;
        }

        // Evaluate variable calls
        if (item.type === types.VARIABLE) {

            // Check if variable has registered handler
            const handler = handlers.find(handler => handler.handle === item.value);
            if (handler == null) {
                throw new ExpressionVariableError(`unknown variable`, item.position, item.value);
            }

            // Check if varname exists in the trigger scope
            if (handler.triggers) {
                let trigger = handler.triggers[options.trigger.type],
                    display = options.trigger.type ? options.trigger.type.toLowerCase() : "unknown trigger";

                if (trigger == null || trigger === false) {
                    throw new ExpressionVariableError(`${varname} does not support being triggered by: ${display}`, item.position, item.value);
                }

                if (Array.isArray(trigger)) {
                    if (!trigger.some(id => id === options.trigger.id)) {
                        throw new ExpressionVariableError(`${varname} does not support this specific trigger type: ${display}`, item.position, item.value);
                    }
                }
            }

            // process args
            let varargs = [];
            if (item.arguments) {
                for (let argIdx = 0; argIdx < item.arguments.length; argIdx += 1) {
                    let argValue = await processTokens(handlers, options, item.arguments[argIdx])
                    varargs.push(argValue);
                }
            }

            // Just checking syntax
            if (options.evaluate === false) {
                result.push('');
                continue;
            }

            // Validate args:
            try {
                await handler.argsCheck(...varargs);
            } catch (err) {
                throw new ExpressionArgumentsError(err.message, err.cursor, err.index, item.value);
            }

            // Call variable handler
            let varResult = await handler.evaluator(options.metadata, ...varargs);
            result.push(varResult);
            continue;
        }
        throw new ExpressionSyntaxError(`unexpected token ${item.type}`, item.position, item.value);
    }

    return result.join('');
};

export default function evaluate(handlers, options) {

    // validate handlers list
    if (handlers == null || !Array.isArray(handlers)) {
        throw new TypeError('handlers list not an array');
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

    let tokenMap = buildLogicMap(options.expression);
    return processTokens(handlers, options, tokenMap);
};