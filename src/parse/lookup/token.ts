import type { EvaluateOptions } from '../../types';
import type { LookupTokenJSON } from '../../tojson-types';

import BaseToken from '../base-token';
import ArgumentsToken from '../arguments/token';

import { ExpressionVariableError } from '../../errors';

/** Represents the options for a new LookupToken instance */
export interface LookupTokenOptions {

    /** Position in the expression the token occurs */
    position: number;

    /** The lookup's prefix */
    prefix: string;

    /** The name following the prefix */
    value: string;

    /** Arguments to pass to the lookup result's `evaluate()` function */
    arguments?: ArgumentsToken;
}

export default class LookupToken extends BaseToken {

    /** Lookup's prefix */
    prefix: string;

    /** The name - following the prefix - to be looked up */
    value: string;

    /** Arguments to pass to the lookup result's `evaluate()` function */
    arguments?: ArgumentsToken;

    constructor(options: LookupTokenOptions) {
        super({
            ...options,
            type: 'LOOKUP'
        });
        this.value = options.value;
        this.prefix = options.prefix;
        this.arguments = options.arguments;
    }

    /** Converts the token to a JSON.stringify()-able object */
    toJSON() : LookupTokenJSON {
        return {
            position: this.position,
            type: this.type,
            prefix: this.prefix,
            value: this.value,
            arguments: this.arguments ? this.arguments.toJSON() : undefined
        }
    }

    /* Evaluates the token */
    async evaluate(options: EvaluateOptions): Promise<unknown> {
        if (!options.lookups) {
            throw new ExpressionVariableError(`lookup map invalid`, this.position, this.value);
        }

        const lookup = options.lookups.get(this.prefix);
        if (lookup == null) {
            throw new ExpressionVariableError(`unknown lookup prefix`, this.position, this.prefix);
        }

        const variable = await lookup(options.data || {}, this.value);

        if (variable == null) {
            return;
        }

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