import { type IOperator, type IHandleState, ArgumentsQuantifier } from '../../token';
import { type default as IParseOptions } from '../../../../../types/options';
import toText from '../../../../../helpers/to-text';

export default <IOperator>{
    name: 'regex',
    arguments: ArgumentsQuantifier.RIGHTREQUIRED,
    description: "Checks if the left operand is a match of the right operand regex",
    alias: ['regex'],
    inverse: {
        description: "Checks if the left operand is not a match of the right operand regex",
        alias: ['!regex']
    },
    handle: async function(options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean | unknown> {
        const { left, right } = state;

        if (left == null || typeof right !== 'string') {
            return;
        }

        const leftText = toText(left);
        if (leftText == null) {
            return false;
        }

        const rightText = toText(right);
        if (rightText == null) {
            return false;
        }

        const parts = /^\/(.*)\/([a-z]*)$/i.exec(<string>rightText);
        if (parts) {
            return (new RegExp(parts[1], parts[2])).test(<string>leftText);
        }
        return (new RegExp(<string>rightText)).test(<string>leftText);
    }
}