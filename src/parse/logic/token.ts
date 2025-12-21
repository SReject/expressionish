import type { EvaluateOptions, LogicOperator } from '../../types';
import type { LogicTokenJSON } from '../../tojson-types';
import type ArgumentsToken from '../arguments/token';

import BaseToken from '../base-token';

import operators from './operators';

/** Represents the options for a new LogicToken instance */
export interface LogicTokenOptions {

    /** Position of the logic conditional within the expression */
    position: number;

    /** The operator used */
    value: string;

    /** Arguments to be passed to the operator's `evaluate()` function */
    arguments: ArgumentsToken;
}

/** Represents a logical-conditional token */
export default class LogicToken extends BaseToken {

    /** The operator used */
    value: string;

    /** Arguments to be passed to the operator's `evaluate()` function */
    arguments: ArgumentsToken;

    constructor(options: LogicTokenOptions) {
        super({
            ...options,
            type: 'LOGIC'
        });
        this.value = options.value;
        this.arguments = options.arguments;
    }

    /** Converts the token to a JSON.stringify()-able object */
    toJSON() : LogicTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value,
            arguments: this.arguments.toJSON()
        };
    }

    /** Evaluates the token */
    async evaluate(options: EvaluateOptions): Promise<unknown> {
        let operator : LogicOperator;
        if (options.logicalOperators?.has(this.value)) {
            operator = options.logicalOperators.get(this.value) as LogicOperator;
        } else if (operators.has(this.value)) {
            operator = operators.get(this.value) as LogicOperator;
        } else {
            return false;
        }

        const args = await this.arguments.evaluate(options);
        if (operator.argsCheck) {
            operator.argsCheck(options.data || {}, ...args);
        }

        if (options.onlyValidate) {
            return;
        }

        return operator.evaluate(options.data || {}, ...args);
    }
}