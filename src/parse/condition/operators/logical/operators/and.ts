import { type default as IParseOptions } from '../../../../../types/options';
import { type IOperator, type IHandleStateDeferred, ArgumentsQuantifier } from '../../token';

export default <IOperator>{
    name: 'logical-and',
    description: "Checks if two conditions are truthy",
    arguments: ArgumentsQuantifier.RIGHTREQUIRED,
    defer: true,
    alias: ['&&'],
    handle: async function (options: IParseOptions, meta: unknown, state: IHandleStateDeferred) : Promise<boolean | undefined> {
        const { arguments: args } = state;

        const left = await args[0].evaluate(options, meta);
        if (left == null || left === false || left === 0 || left === '') {
            return false;
        }

        const right = await args[1].evaluate(options, meta);
        return (right != null && right !== false && right !== 0 && right !== '');
    }
};