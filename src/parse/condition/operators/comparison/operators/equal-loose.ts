import { type IOperator, type IHandleState, ArgumentsQuantifier } from '../../token';
import { type default as IParseOptions } from '../../../../../types/options';

import isPrimitive from '../../../../../helpers/is-primitive';
import toNumber from '../../../../../helpers/to-number';

export default <IOperator>{
    name: 'equals-loose',
    description: "Checks if operands are loosely equal",
    arguments: ArgumentsQuantifier.RIGHTREQUIRED,
    alias: ['=='],
    inverse: {
        description: "Checks if operands are not loosely equal",
        alias: ['!=']
    },
    handle: async function(options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean> {
        const { left, right } = state;

        if (
            left === right ||
            (left == null && right == null) ||
            (Number.isNaN(left) && Number.isNaN(right))
        ) {
            return true;
        }

        if (isPrimitive(left) && isPrimitive(right)) {
            if (String(left).toLowerCase() === String(right).toLowerCase()) {
                return true;
            }

            const leftNum = toNumber(left);
            const rightNum = toNumber(right);

            if (leftNum != null && rightNum != null) {
                return leftNum === rightNum;
            }
        }
        return false;
    }
}