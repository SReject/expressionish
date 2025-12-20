import type { ComparisonOperatorDefinition, EvaluateData } from '../../types';

/** Attempts to convert the two inputs into numeric values */
const toNumber = (data: EvaluateData, v1: unknown, v2: unknown) : [unknown, unknown]|[number, number]=> {
    if (v1 === '' || v2 === '') {
        return [v1, v2];
    }

    const v1Num = Number(v1);
    if (!Number.isFinite(v1Num)) {
        return [v1, v2];
    }

    const v2Num = Number(v2);
    if (!Number.isFinite(v2Num)) {
        return [v1, v2];
    }
    return [v1Num, v2Num];
}

/** Tests if inputs are strictly equal */
const isStrictEqual = (data: EvaluateData, v1: unknown, v2: unknown) => {
    [v1, v2] = toNumber(data, v1, v2);
    return v1 === v2;
};

/** Tests if input is not a nullish value */
const isTruthy = (data: EvaluateData, v1: unknown) => {
    return v1 != null &&
        v1 !== false &&
        v1 !== 0 &&
        v1 !== '';
};

/** Comparison Operator Map */
export default (new Map<string, ComparisonOperatorDefinition>([

    ['istruthy',  {
        maxArgumentsCount: 1,
        evaluate: isTruthy
    }],
    ['!istruthy', {
        maxArgumentsCount: 1,
        evaluate: (data: EvaluateData, v1: unknown) => !isTruthy(data, v1)
    }],

    ['===', {
        minArgumentsCount: 2,
        evaluate: isStrictEqual
    }],
    ['!==', {
        minArgumentsCount: 2,
        evaluate: (data: EvaluateData, v1: unknown, v2: unknown) => !isStrictEqual(data, v1, v2)
    }],

    ['<', {
        minArgumentsCount: 2,
        evaluate: (data: EvaluateData, v1: unknown, v2: unknown) => {
            [v1, v2] = toNumber(data, v1, v2);
            if (typeof v1 !== 'number' || typeof v2 !== 'number') {
                return false;
            }
            return v1 < v2;
        }
    }],
    ['<=', {
        minArgumentsCount: 2,
        evaluate: (data: EvaluateData, v1: unknown, v2: unknown) => {
            [v1, v2] = toNumber(data, v1, v2);
            if (typeof v1 !== 'number' || typeof v2 !== 'number') {
                return false;
            }
            return v1 <= v2;
        }
    }],

    ['>', {
        minArgumentsCount: 2,
        evaluate: (data: EvaluateData, v1: unknown, v2: unknown) => {
            [v1, v2] = toNumber(data, v1, v2);
            if (typeof v1 !== 'number' || typeof v2 !== 'number') {
                return false;
            }
            return v1 > v2;
        }
    }],
    ['>=', {
        minArgumentsCount: 2,
        evaluate: (data: EvaluateData, v1: unknown, v2: unknown) => {
            [v1, v2] = toNumber(data, v1, v2);
            if (typeof v1 !== 'number' || typeof v2 !== 'number') {
                return false;
            }
            return v1 >= v2;
        }
    }]
]));