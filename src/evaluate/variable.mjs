import { ExpressionVariableError, ExpressionArgumentsError } from '../errors.mjs';

import evaluateExpression from './expression.mjs';

export default async function evaluateVariable(handlers, options, item) {
    const handler = handlers.get(item.value);
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
    let args = [];
    if (item.arguments) {
        for (let idx = 0; idx < item.arguments.length; idx += 1) {
            const arg = await evaluateExpression(handlers, options, item.arguments[idx]);
            args.push(arg);
        }
    }

    // Just checking syntax
    if (options.evaluate === false) {
        return '';
    }

    // Validate args:
    try {
        await handler.argsCheck(...args);
    } catch (err) {
        throw new ExpressionArgumentsError(err.message, err.position, err.index, item.value);
    }

    const result = await handler.evaluator(options.metadata, ...args);
    return result || '';
}