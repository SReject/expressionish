import logicalOperators from '../operators/logical.mjs';

import evaluateComparison from './comparison.mjs';
import evaluateExpression from './expression.mjs';

export default async function evaluateLogicOperator(handlers, options, item) {

    // get handler
    const handler = logicalOperators.get(item.value);
    if (handler == null) {
        throw new ExpressionSyntaxError('Unknown comparison operator', item.position, item.value);
    }

    // Process arguments
    const args = [];
    if (item.arguments != null) {
        for (let idx = 0; idx < item.arguments.length; idx += 1) {
            const arg = item.arguments[idx];

            if (arg == null || arg === false || arg === '') {
                args.push(false);

            } else if (arg.type === types.COMPARE_OPERATOR) {
                const res = await evaluateComparison(handlers, options, arg);
                args.push(res);

            } else if (arg.type === types.LOGIC_OPERATOR) {
                const res = await evaluateLogicOperator(handlers, options, arg);
                args.push(res);

            } else {
                const res = await evaluateExpression(handlers, options, arg);
                args.push(res != null && res !== false && res !== '');
            }
        }
    }

    // Just checking syntax: condition always succeeds
    if (options.evaluate === false) {
        return true;
    }

    // Process the logic operator
    let result = handler(...condArgs);
    return result != null && result !== false && result !== '';
};