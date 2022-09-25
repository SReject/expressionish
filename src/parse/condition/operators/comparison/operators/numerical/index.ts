import { type IOperator, type IHandleState, ArgumentsQuantifier } from '../../../token';
import { type default as IParseOptions } from '../../../../../../types/options';
import toNumber from '../../../../../../helpers/to-number';

const isRange = /^((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+))-((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+))$/;

export default <IOperator>{
    name: 'numerical',
    quantifier: ArgumentsQuantifier.RIGHTOPTIONAL,
    description: "Checks if the left operand is numerical and if specified within the range of the right operand (inclusive)",
    alias: ['isnum', 'isnumber'],
    inverse: {
        description: "Checks if the left operand is not numerical and if specified not within the range of the right operand (inclusive)",
        alias: ['!isnum', '!isnumber']
    },
    handle: async function(options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean | unknown> {
        const { left, right } = state;

        const v1 = toNumber(left);
        if (v1 == null) {
            return false;
        }
        if (right == null) {
            return true;
        }

        if (right == null || right === '') {
            return true;
        }

        if (typeof right != 'string') {
            return v1 === right;
        }

        const range = isRange.exec(right);
        if (!range) {
            return;
        }

        const r1 = Number(range[1]);
        const r2 = Number(range[2]);

        if (r1 > r2) {
            return r2 <= v1 && v1 <= r1;
        }

        return r1 <= v1 && v1 <= r2;
    }
}