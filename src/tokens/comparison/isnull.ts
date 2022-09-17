import ParserOptions from '../../types/options';
import ComparisonToken, { IComparisonToken } from './base';

export default class IsNull extends ComparisonToken {
    constructor(token: IComparisonToken) {
        super({
            ...token,
            value: 'isnull'
        });
    }

    async handle(options: ParserOptions, meta: unknown): Promise<boolean> {
        const v1 = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        return v1 == null;
    }
}