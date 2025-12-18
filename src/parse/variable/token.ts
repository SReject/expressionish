import type { EvaluateOptions, Variable } from '../../types';
import type { VariableTokenJSON } from '../../tojson-types'

import type ArgumentsToken from '../arguments/token';
import BaseToken from '../base-token';

export interface VariableTokenOptions {
    position: number;
    value: string;
    arguments?: ArgumentsToken
}

export default class VariableToken extends BaseToken {
    value: string;
    arguments?: ArgumentsToken;

    constructor(options: VariableTokenOptions) {
        super({
            ...options,
            type: 'VARIABLE'
        });
        this.value = options.value || '';
        this.arguments = options.arguments;
    }

    toJSON() : VariableTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value,
            arguments: this.arguments ? this.arguments.toJSON() : undefined
        }
    }

    async evaluate(options: EvaluateOptions): Promise<unknown> {
        if (!options.variables || !options.variables.has(this.value)) {
            throw new Error('unknown variable');
        }

        const variable = options.variables.get(this.value) as Variable;

        if (options.preeval) {
            await options.preeval(options.data || {}, variable);
        }

        if (variable.preeval) {
            await variable.preeval(options.data || {}, variable);
        }

        let args : unknown[] = [];
        if (this.arguments) {
            args = await this.arguments.evaluate(options);
        }

        if (variable.argsCheck) {
            await variable.argsCheck(options.data || {}, ...args);
        }

        return variable.evaluate(options.data || {}, ...args);
    }
}