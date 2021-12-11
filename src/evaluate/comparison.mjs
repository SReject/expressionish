import compareOperators from '../operators/compare.mjs';

import evaluateExpression from './expression.mjs';

export default async (handlers, options, item) => {

    // get handler
    const handler = compareOperators.get(item.value);
    if (handler == null) {
        throw new ExpressionSyntaxError('Unknown comparison operator', item.position, item.value);
    }

    // Process arguments
    let condArgs = [];
    if (item.arguments != null) {
        for (let idx = 0; idx < item.arguments.length; idx += 1) {
            const condArg = await evaluateExpression(handlers, options, item.arguments[idx]);
            condArgs.push(condArg);
        }
    }

    // Just checking syntax: condition always succeeds
    if (options.evaluate === false) {
        return true;
    }

    // Process the comparison operator
    let result = handler(...condArgs);
    return result != null && result !== false && result !== '';
};