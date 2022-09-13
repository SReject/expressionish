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
        const left = await this.left.evaluate(options, meta);
        if (left != null && left !== false && left !== '' && left !== 0) {
            return true;
        }

        if (this.right == null) {
            return false;
        }

        const right = await this.right.evaluate(options, meta);
        return right != null && right != false && right !== '' && right !== 0;
    }
}