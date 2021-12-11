import { ExpressionVariableError } from '../errors.mjs';

import evaluateComparision from './comparison.mjs';
import evaluateLogicOperator from './logical-operators.mjs';
import evaluateExpression from './expression.mjs';

export default async function evaluateIf(handlers, options, item) {
    if (
        item.argumments == null ||
        !Array.isArray(item.arguments) ||
        item.arguments.length < 2
    ) {
        throw new ExpressionVariableError('$if requires atleast 2 arguments', item.position, 'if');
    }

    if (item.arguments.length > 3) {
        throw new ExpressionVariableError('excessive parameters for if', item.arguments[3].position, 'if');
    }

    const [condition, whenTrue, whenFalse] = item.arguments;

    let conres;
    if (condition.type === types.COMPARE_OPERATOR) {
        conres = await evaluateComparision(handlers, options, condition);

    } else if (condition.type === types.LOGIC_OPERATOR) {
        conres = await evaluateLogicOperator(handlers, options, condition);

    } else {
        conres = await evaluateExpression(handlers, options, condition);
        conres = (conres != null && conres !== false && conres !== '');
    }

    if (options.evaluate === false) {
        await evaluateExpression(handlers, options, whenTrue);
        if (whenFalse != null) {
            await evaluateExpression(handlers, options, whenFalse);
        }
        return '';
    }

    return await processexpression(handlers, options, conres ? whenTrue : whenFalse);
};