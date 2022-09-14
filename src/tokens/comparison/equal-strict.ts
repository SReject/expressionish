import ParserOptions from '../../types/options';
import ComparisonToken, { IComparisonToken } from './base';

export default class EqualStrictToken extends ComparisonToken {
    constructor(token: IComparisonToken) {
        super({
            ...token,
            value: 'equal'
        });
    }

    async handle(options: ParserOptions, meta?: any): Promise<boolean> {
        if (this.right == null) {
            // TODO - custom error
            throw new Error('TODO - Evaluation Error: Right hand argument missing');
        }

        const v1 = await this.left.evaluate(options, meta);
        const v2 = await this.right.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        return (
            v1 === v2 ||
            (v1 == null && v2 == null) ||
            (Number.isNaN(v1) && Number.isNaN(v2))
        );
    }
}