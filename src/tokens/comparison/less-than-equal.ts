import { ParserOptions } from '../../types/options';
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
        let v1 = await this.arguments[0].evaluate(options, meta);
        let v2 = await this.arguments[1].evaluate(options, meta);

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