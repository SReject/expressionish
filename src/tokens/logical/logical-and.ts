import ParserOptions from '../../types/options';
import { default as LogicalToken, ILogicalToken } from './base';

export default class AndOperator extends LogicalToken {
    constructor(token: ILogicalToken) {
        super({
            ...token,
            value: 'and'
        });
    }

    async evaluate(options: ParserOptions, meta?: any): Promise<boolean> {
        if (this.right == null) {
            // TODO - custom errors
            throw new Error('TODO');
        }

        const left = await this.left.evaluate(options, meta);
        if (options.verifyOnly) {
            await this.right.evaluate(options, meta);
            return false;
        }
        if (left == null || left === false || left === '' || left === 0) {
            return false;
        }


        const right = await this.right.evaluate(options, meta);
        return right != null && right != false && right !== '' && right !== 0;
    }
}