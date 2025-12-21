import type { EvaluateOptions, LogicOperator } from '../../types';
import type { LogicTokenJSON } from '../../tojson-types';
import type ArgumentsToken from '../arguments/token';

import BaseToken from '../base-token';

import operators from './operators';

export interface LogicTokenOptions {
    position: number;
    value: string;
    arguments: ArgumentsToken;
}

export default class LogicToken extends BaseToken {
    value: string;
    arguments: ArgumentsToken;

    constructor(options: LogicTokenOptions) {
        super({
            ...options,
            type: 'LOGIC'
        });
        this.value = options.value;
        this.arguments = options.arguments;
    }

    toJSON() : LogicTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value,
            arguments: this.arguments.toJSON()
        };
    }

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