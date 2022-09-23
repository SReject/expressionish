import { type IOperator, type IHandleState, ArgumentsQuantifier } from '../../token';
import { type default as IParseOptions } from '../../../../../types/options';

export default <IOperator>{
    name: 'equal-strict',
    description: "Checks if operands are strictly equal",
    arguments: ArgumentsQuantifier.RIGHTREQUIRED,
    alias: ['==='],
    inverse: {
        description: "Checks if operands are not strictly equal",
        alias: ['!==']
    },
    handle: async function (options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean> {
        const { left, right } = state;
        return (
            left === right ||
            (left == null && right == null) ||
            (Number.isNaN(left) && Number.isNaN(right))
        );
    }
}