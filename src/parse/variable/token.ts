import type ArgumentsToken from '../arguments/token';
import BaseToken from '../base-token';

interface VariableTokenOptions {
    position: number;
    value: string;
    arguments?: ArgumentsToken
}
export default class VariableToken extends BaseToken {
    value: string = '';
    arguments?: ArgumentsToken;

    constructor(options: VariableTokenOptions) {
        super({
            ...options,
            type: 'VARIABLE'
        });
        if (options.arguments) {
            this.arguments = options.arguments;
        }
    }

    toJSON() {
        const result : {
            position: number,
            value: unknown,
            type: string,
            arguments?: unknown
        }= super.toJSON();
        if (this.arguments) {
            result.arguments = this.arguments.toJSON();
        }
        return result;
    }

    async evaluate(options: EvaluateOptions): Promise<unknown> {
        if (!options.variables || !options.variables.has(this.value)) {
            throw new Error('unknown variable');
        }

        const variable = options.variables.get(this.value) as Variable;

        if (options.preeval) {
            await options.preeval(options, variable);
        }

        if (variable.preeval) {
            await variable.preeval(options, variable);
        }

        let args : unknown[] = [];
        if (this.arguments) {
            args = await this.arguments.evaluate(options);
        }

        if (variable.argsCheck) {
            await variable.argsCheck(options.metadata || {}, ...args);
        }

        return variable.evaluate(options.metadata || {}, ...args);
    }
}