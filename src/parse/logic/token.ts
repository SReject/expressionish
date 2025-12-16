import type { EvaluateOptions } from '../../types';
import type { ArgumentsTokenJSON } from '../../tojson-types';

import BaseToken, { type BaseTokenJSON } from '../base-token';
import type { default as ArgumentsToken } from '../arguments/token';

import operators from './operators';

export interface LogicTokenOptions {
    position: number;
    value: string;
    arguments: ArgumentsToken;
}

export interface LogicTokenJSON extends BaseTokenJSON {
    value: string,
    arguments: ArgumentsTokenJSON
}

export default class LogicToken extends BaseToken {
    arguments: ArgumentsToken;
    value: string = '';

    constructor(options: LogicTokenOptions) {
        super({
            ...options,
            type: 'LOGIC'
        });
        this.arguments = options.arguments;
    }

    toJSON() : LogicTokenJSON {
        return {
            ...super.toJSON(),
            arguments: this.arguments.toJSON()
        } as LogicTokenJSON;
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