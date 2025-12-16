import BaseToken from '../base-token';
import ArgumentsToken from '../arguments/token';

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

    toJSON() : ({
        position: number,
        type: string,
        prefix: string,
        value: unknown,
        arguments: unknown
    }) {
        const result = {
            ...super.toJSON(),
            prefix: this.prefix,
            arguments: undefined as unknown
        };
        if (this.arguments != null) {
            result.arguments = this.arguments.toJSON();
        }
        return result;
    }

    async evaluate(options: EvaluateOptions): Promise<unknown> {
        if (!options.lookups) {
            throw new Error(`lookups map invalid ${this.position} ${this.value}`)
        }
        const lookup = options.lookups.get(this.prefix);
        if (lookup == null) {
            throw new Error(`unknown lookup prefix ${this.position} ${this.prefix} ${this.value}`);
        }

        const variable = lookup(this.value);
        if (variable == null) {
            return;
        }

        if (options.preeval) {
            options.preeval(options, variable);
        }
        if (variable.preeval) {
            variable.preeval(options, variable);
        }

        let args : unknown[] = [];
        if (this.arguments) {
            args = await this.arguments.evaluate(options);
        }

        if (options.onlyValidate) {
            return;
        }

        if (variable.argsCheck) {
            await variable.argsCheck(options.metadata || {}, ...args);
        }

        return variable.evaluate(options.metadata || {}, ...args);
    }
}