import ParserOptions from '../../types/options';
import { default as ComparisonToken, IComparisonToken } from './base';
import toNumber from '../../helpers/to-number';

export default class LessThanEqualToken extends ComparisonToken {
    constructor(token: IComparisonToken) {
        super({
            ...token,
            value: 'less-than-or-equal'
        });
    }

    async handle(options: ParserOptions, meta?: any): Promise<boolean> {
        if (this.right == null) {
            // TODO - custom error
            throw new Error('TODO');
        }

        let v1 = await this.left.evaluate(options, meta);
        let v2 = await this.right.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        v1 = toNumber(v1);
        if (v1 == null) {
            return false;
        }

        v2 = toNumber(v2);
        if (v2 == null) {
            return false;
        }

        return v1 <= v2;
    }
}