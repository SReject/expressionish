import { ParserOptions } from '../../types/options';
import { default as ComparisonToken, IComparisonToken } from './base';
import toNumber from '../../helpers/to-number';

const isRange = /^((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+))-((?:[+-]?\d+(?:\.\d+)?)|(?:[+-]?\.\d+))$/;

export default class LessThanToken extends ComparisonToken {
    constructor(token: IComparisonToken) {
        super({
            ...token,
            value: 'numerical'
        });
    }

    async handle(options: ParserOptions, meta?: any): Promise<boolean> {
        let v1 = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            if (this.right != null) {
                await this.right.evaluate(options, meta);
            }
            return false;
        }

        v1 = toNumber(v1);
        if (v1 == null) {
            return false;
        }
        if (this.right == null) {
            return true;
        }

        let v2 = await this.right.evaluate(options, meta);
        if (v2 == null || v2 === '') {
            return true;
        }

        if (typeof v2 != 'string') {
            return v1 === v2;
        }

        const range = isRange.exec(v2);
        if (!range) {
            return false;
        }

        const r1 = Number(range[1]);
        const r2 = Number(range[2]);

        if (r1 > r2) {
            return r2 <= v1 && v1 <= r1;
        }

        return r1 <= v1 && v1 <= v2;
    }
}