import type { EvaluateOptions, Variable } from '../../types';
import type { VariableTokenJSON } from '../../tojson-types'

import type ArgumentsToken from '../arguments/token';
import BaseToken from '../base-token';

/** Represents the options for a new VariableToken instance */
export interface VariableTokenOptions {

    /** Position of the variable within the expression */
    position: number;

    /** The variable's name */
    value: string;

    /** Arguments to evaluate & pass to the variable's evaluate function */
    arguments?: ArgumentsToken
}

/** Represents a Variable token */
export default class VariableToken extends BaseToken {

    /** The variable name */
    value: string;

    /** Arguments to evaluate & pass to the variable's evaluate function */
    arguments?: ArgumentsToken;

    constructor(options: VariableTokenOptions) {
        super({
            ...options,
            type: 'VARIABLE'
        });
        this.value = options.value || '';
        this.arguments = options.arguments;
    }

    /** Converts the token to a JSON.stringify()-able object */
    toJSON() : VariableTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value,
            arguments: this.arguments ? this.arguments.toJSON() : undefined
        }
    }

    /** Evaluates the token */
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

        if (options.onlyValidate) {
            return;
        }

        return variable.evaluate(options.data || {}, ...args);
    }
}