import ParserOptions from '../../types/options';
import { default as LogicalToken, ILogicalToken } from './base';

export type INotOperator = Omit<ILogicalToken, "value" | "type">;

export default class NotOperator extends LogicalToken {
    constructor(token: INotOperator) {
        super({
            ...token,
            value: 'not'
        });
    }

    async evaluate(options: ParserOptions, meta: unknown): Promise<boolean> {
        const value = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        return value != null && value !== false && value !== '' && value !== 0;
    }
}