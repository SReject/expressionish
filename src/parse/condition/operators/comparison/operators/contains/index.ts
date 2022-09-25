import { type IOperator, type IHandleState, ArgumentsQuantifier } from '../../../token';

import { type default as IParseOptions } from '../../../../../../types/options';

export default <IOperator>{
    name: 'contains',
    description: "Checks if the left operand contains the right operand",
    quantifier: ArgumentsQuantifier.RIGHTREQUIRED,
    cased: true,
    alias: ['contains'],
    inverse: {
        description: "Checks if operands are not loosely equal",
        alias: ['!contains']
    },
    handle: async function (options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean | undefined> {

        const { left, right, caseSensitive = false } = state;

        if (Array.isArray(left)) {
            return left.some((left: unknown) => {
                if (typeof left === 'string') {
                    if (typeof right !== 'string') {
                        return false;
                    }
                    if (caseSensitive) {
                        return left === right;
                    }
                    return left.toLowerCase() === right.toLowerCase();
                }
                return left === right;
            });
        }

        if (typeof left === 'string' && typeof right === 'string') {
            if (caseSensitive) {
                return left.includes(right);
            }
            return left.toLowerCase().includes(right.toLowerCase());
        }
    }
};