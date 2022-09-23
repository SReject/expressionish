import { type IOperator, type IHandleState, ArgumentsQuantifier } from '../../token';
import { type default as IParseOptions } from '../../../../../types/options';

export default <IOperator>{
    name: 'isnull',
    arguments: ArgumentsQuantifier.LEFTONLY,
    description: "Checks if the left operand is null or undefined",
    alias: ['isnull'],
    inverse: {
        description: "Checks if the left operand is not null or undefined",
        alias: ['!isnull']
    },
    handle: async function (options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean> {
        const { left } = state;
        return left == null;
    }
}