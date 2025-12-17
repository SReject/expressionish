import type { EvaluateOptions } from '../../types';
import type { LookupTokenJSON } from '../../tojson-types';

import BaseToken from '../base-token';
import ArgumentsToken from '../arguments/token';

import { ExpressionVariableError } from '../../errors';

export interface LookupTokenOptions {
    position: number;
    prefix: string;
    value: string;
    arguments?: ArgumentsToken;
}

export default class LookupToken extends BaseToken {
    prefix: string;
    value: string = '';
    arguments?: ArgumentsToken;

    constructor(options: LookupTokenOptions) {
        super({
            ...options,
            type: 'LOOKUP'
        });
        this.prefix = options.prefix;
        this.arguments = options.arguments;
    }

    toJSON() : LookupTokenJSON {
        return {
            position: this.position,
            type: this.type,
            prefix: this.prefix,
            value: this.value,
            arguments: this.arguments ? this.arguments.toJSON() : undefined
        }
    }

    async evaluate(options: EvaluateOptions): Promise<unknown> {
        if (!options.lookups) {
            throw new ExpressionVariableError(`lookup map invalid`, this.position, this.value);
        }
        const lookup = options.lookups.get(this.prefix);
        if (lookup == null) {
            throw new ExpressionVariableError(`unknown lookup prefix`, this.position, this.prefix);
        }

        const variable = lookup(this.value);
        if (variable == null) {
            return;
        }

        if (options.preeval) {
            options.preeval(options.data || {}, variable);
        }
        if (variable.preeval) {
            variable.preeval(options.data || {}, variable);
        }

        let args : unknown[] = [];
        if (this.arguments) {
            args = await this.arguments.evaluate(options);
        }

        if (options.onlyValidate) {
            return;
        }

        if (variable.argsCheck) {
            // Should throw an ExpressionArgumentsError if argsCheck fails
            await variable.argsCheck(options.data || {}, ...args);
        }

        return variable.evaluate(options.data || {}, ...args);
    }
}