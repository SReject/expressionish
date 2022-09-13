import { ParserOptions } from '../../types/options';
import { default as ComparisonToken, IComparisonToken } from './base';

export default class EqualStrictToken extends ComparisonToken {
    constructor(token: IComparisonToken) {
        super({
            ...token,
            value: 'equal'
        });
    }

    async handle(options: ParserOptions, meta?: any): Promise<boolean> {
        const v1 = await this.arguments[0].evaluate(options, meta);
        const v2 = await this.arguments[1].evaluate(options, meta);

        return (
            v1 === v2 ||
            (v1 == null && v2 == null) ||
            (Number.isNaN(v1) && Number.isNaN(v2))
        );
    }
}