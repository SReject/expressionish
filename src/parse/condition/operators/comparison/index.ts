import { type default as IParseOptions } from '../../../../types/options';

import { type IOperator, type IHandleState } from '../token';

import operatorContains from './operators/contains';
import operatorEqualLoose from './operators/equal-loose';
import operatorEqualStrict from './operators/equal-strict';
import operatorExists from './operators/exists';
import operatorGreaterThanOrEqual from './operators/greater-than-or-equal';
import operatorGreaterThan from './operators/greater-than';
import operatorIsBool from './operators/is-bool';
import operatorIsNull from './operators/is-null';
import operatorLessThanOrEqual from './operators/less-than-or-equal';
import operatorLessThan from './operators/less-than';
import operatorNumerical from './operators/numerical';
import operatorRegex from './operators/regex';
import operatorWildcard from './operators/wildcard';

const operators : Map<string, IOperator> = new Map();
[
    operatorContains,
    operatorEqualLoose,
    operatorEqualStrict,
    operatorExists,
    operatorGreaterThan,
    operatorGreaterThanOrEqual,
    operatorIsBool,
    operatorIsNull,
    operatorLessThan,
    operatorLessThanOrEqual,
    operatorNumerical,
    operatorRegex,
    operatorWildcard
].forEach((operator : IOperator) => {
    operator.alias.forEach(alias => {
        operators.set(alias, operator);
    });

    if (operator.inverse) {
        const opin = operator.inverse;
        opin.alias.forEach(alias => {
            const base : IOperator = { ...operator, inverse: undefined, ...opin };

            if (!opin.handle) {
                base.handle = async function (options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean | undefined> {
                    const result = await operator.handle.call(this, options, meta, state);
                    if (result != null) {
                        return !result;
                    }
                };
            }
            operators.set(alias, base);
        });
    }
});


export default operators;