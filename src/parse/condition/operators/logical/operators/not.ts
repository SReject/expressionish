import { type default as IParseOptions } from '../../../../../types/options';
import { type IOperator, type IHandleStateDeferred, ArgumentsQuantifier } from '../../token';

export default <IOperator>{
    name: 'logical-not',
    description: "Checks if two conditions are truthy",
    arguments: ArgumentsQuantifier.LEFTONLY,
    defer: true,
    alias: [],
    handle: async function (options: IParseOptions, meta: unknown, state: IHandleStateDeferred) : Promise<boolean | undefined> {
        const { arguments: args } = state;

        const left = await args[0].evaluate(options, meta);
        return (left == null || left === false || left === 0 || left === '');
    }
};