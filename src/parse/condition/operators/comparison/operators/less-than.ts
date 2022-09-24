import { type IOperator, type IHandleState, ArgumentsQuantifier } from '../../token';
import { type default as IParseOptions } from '../../../../../types/options';
import toNumber from '../../../../../helpers/to-number';

export default <IOperator>{
    name: 'less-than',
    description: "Checks if the left operand is numerical and less than the right operand",
    quantifier: ArgumentsQuantifier.RIGHTREQUIRED,
    alias: ['<'],
    handle: async function(options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean | unknown> {
        const { left, right } = state;

        const leftNum = toNumber(left);
        if (leftNum == null) {
            return;
        }

        const rightNum = toNumber(right);
        if (rightNum == null) {
            return;
        }

        return leftNum <= rightNum;
    }
}