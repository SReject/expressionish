import ParserOptions from '../../types/options';

import ComparisonToken, { IComparisonToken } from './base';
import toNumber from '../../helpers/to-number';
import isPrimitive from '../../helpers/is-primitive';

export default class EqualLooseToken extends ComparisonToken {
    constructor(token: IComparisonToken) {
        super({
            ...token,
            value: 'equal-loose'
        });
    }

    async handle(options: ParserOptions, meta?: any): Promise<boolean> {

        if (this.right == null) {
            // TODO - custom error
            throw new Error('TODO');
        }

        const v1 = await this.left.evaluate(options, meta);
        const v2 = await this.right.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        if (
            v1 === v2 ||
            (v1 == null && v2 == null) ||
            (Number.isNaN(v1) && Number.isNaN(v2))
        ) {
            return true;
        }

        if (isPrimitive(v1) && isPrimitive(v2)) {
            if (String(v1).toLowerCase() === String(v2).toLowerCase()) {
                return true;
            }

            const v1Num = toNumber(v1);
            const v2Num = toNumber(v2);

            if (v1Num != null && v2Num != null) {
                return v1Num === v2Num;
            }
        }
        return false;
    }
}