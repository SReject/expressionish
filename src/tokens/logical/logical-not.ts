import { ParserOptions } from '../../types/options';
import { default as LogicalToken, ILogicalToken } from './base';

export default class NotOperator extends LogicalToken {
    constructor(token: ILogicalToken) {
        super({
            ...token,
            value: 'not'
        });
    }

    async evaluate(options: ParserOptions, meta?: any): Promise<boolean> {
        const value = await this.arguments[0].evaluate(options, meta);
        return value != null && value !== false && value !== '' && value !== 0;
    }
}