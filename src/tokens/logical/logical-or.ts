import ParserOptions from '../../types/options';
import { default as LogicalToken, ILogicalToken } from './base';

export default class OrOperator extends LogicalToken {
    constructor(token: ILogicalToken) {
        super({
            ...token,
            value: 'or'
        });
    }

    async evaluate(options: ParserOptions, meta: unknown): Promise<boolean> {
        if (this.right == null) {
            // TODO - custom errors
            throw new Error('TODO');
        }

        const left = await this.left.evaluate(options, meta);
        if (options.verifyOnly) {
            await this.right.evaluate(options, meta);
            return false;
        }

        if (left != null && left !== false && left !== '' && left !== 0) {
            return true;
        }

        const right = await this.right.evaluate(options, meta);
        return right != null && right != false && right !== '' && right !== 0;
    }
}