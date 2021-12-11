import types from "../helpers/token-types.mjs";

import evaluateIf from './if.mjs';
import evaluateVariable from './variable.mjs';

export default async function evaluateToken(handlers, options, items) {
    const result = [];

    for (let idx = 0; idx < items.length; idx += 1) {
        const item = items[idx];

        if (item.type === types.LITERAL_TEXT) {
            result.push(item.value || '');

        } else if (item.type === types.IF_VARIABLE) {
            let res = await evaluateIf(handlers, options, item);
            result.push(res || '');

        } else if (item.type === types.VARIABLE) {
            let res = await evaluateVariable(handlers, options, item);
            result.push(res || '');

        } else {
            throw new ExpressionSyntaxError(`unexpected token ${item.type}`, item.position, item.value);
        }
    }

    return result.join('');
};