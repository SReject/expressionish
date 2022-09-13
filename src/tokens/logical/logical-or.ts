import { ParserOptions } from '../../types/options';
import { default as LogicalToken, ILogicalToken } from './base';

export default class OrOperator extends LogicalToken {
    constructor(token: ILogicalToken) {
        super({
            ...token,
            value: 'or'
        });
    }

    async evaluate(options: ParserOptions, meta?: any): Promise<boolean> {
        const left = await this.arguments[0].evaluate(options, meta);
        if (left != null && left !== false && left !== '' && left !== 0) {
            return true;
        }

        const right = await this.arguments[1].evaluate(options, meta);
        return right != null && right != false && right !== '' && right !== 0;
    }
}