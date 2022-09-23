import { type IOperator, type IHandleState, ArgumentsQuantifier } from '../../token';
import { type default as IParseOptions } from '../../../../../types/options';
import toNumber from '../../../../../helpers/to-number';

export default <IOperator>{
    name: "greater-than-or-equal",
    arguments: ArgumentsQuantifier.RIGHTREQUIRED,
    description: "Checks if the left operand is numerical and greater than or equal to the right operand",
    alias: ['>='],
    handle: async function (options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean | undefined> {
        const { left, right } = state;
        const leftNum = toNumber(left);
        if (leftNum == null) {
            return;
        }

        const rightNum = toNumber(right);
        if (rightNum == null) {
            return;
        }

        return leftNum >= rightNum;
    }
}