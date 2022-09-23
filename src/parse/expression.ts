import type IParseOptions from '../types/options';
import type Token from './token';

export interface IExpression {
    options: IParseOptions,
    input: string,
    tokens: Token[];
}

export default class Expression {
    public options: IParseOptions;
    public input : string;
    public tokens: Token[];

    constructor(expression: IExpression) {
        this.options = expression.options;
        this.input = expression.input;
        this.tokens = expression.tokens;
    }

    toJSON() : Record<string, unknown> {
        return {
            options: { ...(this.options) },
            input: this.input,
            value: this.tokens.forEach(value => value.toJSON())
        };
    }

    async evaluate(options: IParseOptions = {}, meta: unknown = {}) : Promise<string> {
        const config = {
            ...(this.options),
            ...options
        };

        let result = '';
        let index = 0;
        while (index < this.tokens.length) {
            let value = await this.tokens[index].evaluate(config, meta);
            index += 1;

            if (
                options.verifyOnly ||
                value == null ||
                (typeof value === 'number' && !Number.isFinite(value))
            ) {
                continue;
            }

            if (typeof value !== 'string') {
                value = JSON.stringify(value);
            }

            result += <string>value;
        }

        if (config.verifyOnly) {
            return '';
        }

        return result;
    }
}