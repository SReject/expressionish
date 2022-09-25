import { type IOperator, type IHandleState, ArgumentsQuantifier } from '../../../token';
import { type default as IParseOptions } from '../../../../../../types/options';

export default <IOperator>{
    name: 'exists',
    description: "Checks if operands are strictly equal",
    quantifier: ArgumentsQuantifier.LEFTONLY,
    alias: ['exists'],
    inverse: {
        description: "Checks if operands are not strictly equal",
        alias: ['!exists']
    },
    handle: async function (options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean> {
        return state.left != null && state.left !== '' && state.left !== false;
    }
}