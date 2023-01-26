import has from '../../helpers/has';
import isObject from '../../helpers/is-object';

import {
    type RequireAtLeastOne,
    type IQuantifiedList
} from './_support';

type IHandleFnc<T> = (...args: unknown[]) => Promise<T>;

interface IInverseQuantified {
    signifier: string | string[];
    evaluate: IHandleFnc<boolean>;
}
type IInverseOptions = RequireAtLeastOne<IInverseQuantified>

export enum OperatorQuantifier {
    LEFTONLY,
    RIGHTOPTIONAL,
    RIGHTREQUIRED,
    PREBLOCK,
    BLOCK
}

export interface IOperatorOptionsDefinition {
    signifier: string | string[];
    quantifier: OperatorQuantifier;
    cased?: boolean;
    defer?: boolean;
    inverse?: boolean | IInverseOptions;
    evaluate: IHandleFnc<boolean>
}

export type IOperatorOptions = boolean | IQuantifiedList<IOperatorOptionsDefinition[]>;

export interface IOperatorQuantified {
    signifier: string;
    quantifier: OperatorQuantifier;
    cased: boolean;
    defer: boolean;
    evaluate: IHandleFnc<boolean>
}

export default (
    signifiers: string[],
    registry: Record<string, unknown>,
    operator: IOperatorOptionsDefinition
) => {

    // helpers
    const PROPBASE = { writable: false, enumerable: true, configurable: false };
    const invalidMultis : string[] = [];
    const invalidSingles = new RegExp(`[!\\s${
        signifiers.map(value => {
            if (value.length === 1) return '\\value';
            if (value.length > 1) invalidMultis.push(value);
        }).filter(value => value != null).join('')
    }]`);


    // operator
    if (operator == null || !isObject(operator)) {
        throw new Error('TODO');
    }

    const { quantifier } = operator
    let { signifier, cased, defer, inverse, evaluate } = operator;


    // operator.signifier
    if (signifier == null || signifier === '') {
        throw new Error('TODO');
    } else if (typeof signifier === 'string') {
        signifier = [signifier];
    } else if (!Array.isArray(signifier)) {
        throw new Error('TODO');
    } else if (!signifier.length) {
        throw new Error('TODO');
    }


    // operator.cased
    if (typeof cased == null) {
        cased = false;
    } else if (typeof cased !== 'boolean') {
        throw new Error('TODO');
    }


    // operator.defer
    if (typeof defer == null) {
        defer = false;
    } else if (typeof defer !== 'boolean') {
        throw new Error('TODO');
    }


    // operator.quantifier
    if (quantifier == null || !Number.isInteger(quantifier) || !(quantifier in OperatorQuantifier)) {
        throw new Error('TODO');
    }


    // operator.evaluate
    if (typeof evaluate !== 'function') {
        throw new Error('TODO');
    }


    // operator.inverse
    if (inverse == null) {
        inverse = false;
    } else if (inverse === true) {
        inverse = {
            signifier: signifier.map(value => `!${value}`),
            evaluate: async (...args: unknown[]) => !(await evaluate(...args))
        };
    } else if (inverse !== false) {
        if (!isObject(inverse)) {
            throw new Error('TODO');
        }
        if (inverse.signifier == null && inverse.evaluate == null) {
            throw new Error('TODO');
        }
        if (inverse.signifier == null) {
            inverse.signifier = signifier.map(value => `!${value}`);
        } else if (inverse.signifier === '') {
            throw new Error('TODO');
        } else if (typeof inverse.signifier === 'string') {
            inverse.signifier = [inverse.signifier];
        } else if (!Array.isArray(inverse.signifier)) {
            throw new Error('TODO');
        } else if (!inverse.signifier.length) {
            throw new Error('TODO');
        }

        if (inverse.evaluate == null) {
            inverse.evaluate = async (...args: unknown[]) => !(await evaluate(...args))
        } else if (typeof inverse.evaluate !== 'function') {
            throw new Error('TODO');
        }
    }


    const operators : Record<string, IOperatorQuantified> = {};

    // Realize operators
    signifier.forEach(key => {
        if (typeof key !== 'string') {
            throw new Error('todo');
        }
        if (
            key === '' ||
            invalidSingles.test(key) ||
            invalidMultis.some(multi => key.includes(multi))
        ) {
            throw new Error('TODO');
        }
        key = key.toLowerCase();
        if (has(registry, key) || has(operators, key)) {
            throw new Error('TODO');
        }
        operators[key] = Object.freeze(Object.create(null, {
            'signifier': { ...PROPBASE, value: key },
            'cased': { ...PROPBASE, value: cased},
            'defer': { ...PROPBASE, value: defer},
            'quantifier': { ...PROPBASE, value: quantifier },
            'evaluate': { ...PROPBASE, value: evaluate }
        }));
    });

    if (inverse == null || inverse === false) {
        Object.assign(registry, operators);
    }

    signifier = (<IInverseQuantified>inverse).signifier;
    evaluate = (<IInverseQuantified>inverse).evaluate;

    (<string[]>signifier).forEach(key => {
        if (typeof key !== 'string') {
            throw new Error('todo');
        }
        let value = key;
        if (key[0] === '!') {
            value = key.slice(1);
        }
        if (
            value === '' ||
            invalidSingles.test(value) ||
            invalidMultis.some(multi => value.includes(multi))
        ) {
            throw new Error('TODO');
        }
        key = key.toLowerCase();
        if (has(registry, key) || has(operators, key)) {
            throw new Error('TODO');
        }
        operators[key] = Object.freeze(Object.create(null, {
            'signifier': { ...PROPBASE, value: key },
            'cased': { ...PROPBASE, value: cased},
            'defer': { ...PROPBASE, value: defer},
            'quantifier': { ...PROPBASE, value: quantifier },
            'evaluate': { ...PROPBASE, value: evaluate }
        }));
    });

    return Object.assign(registry, operators);
};