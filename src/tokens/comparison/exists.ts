import { ParserOptions } from '../../types/options';
import { default as ComparisonToken, IComparisonToken } from './base';

export default class ExistsToken extends ComparisonToken {
    constructor(token: IComparisonToken) {
        super({
            ...token,
            value: 'exists'
        });
    }

    async handle(options: ParserOptions, meta?: any): Promise<boolean> {
        let v1 = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        return v1 != null && v1 !== '';
    }
}