import type { EvaluateData, LogicOperator, LogicOperatorMap } from '../../types';

const not = (data: EvaluateData, arg: unknown) => (arg == null || arg === false || arg === 0 || arg === '');

export default (new Map<string, LogicOperator>([
    ['not', {
        minArgumentsCount: 1,
        maxArgumentsCount: 1,
        evaluate: not
    }],
    ['and', {
        minArgumentsCount: 1,
        evaluate: (data: EvaluateData, ...args: unknown[]) => {
            if (args == null || !args.length) {
                return false;
            }
            return !args.some(item => not(data, item));
        }
    }],
    ['or', {
        minArgumentsCount: 1,
        evaluate: (data: EvaluateData, ...args: unknown[]) => {
            if (args == null || !args.length) {
                return false;
            }
            return args.some(item => !not(data, item));
        }
    }],
])) as LogicOperatorMap;