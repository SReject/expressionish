import type { EvaluateOptions } from '../../types';
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
        const operator = operators.get(this.value);
        if (!operator) {
            return false;
        }

        const args = await this.arguments.evaluate(options);

        if (options.onlyValidate) {
            return;
        }

        return operator(...args);
    }
}