import ParserOptions from '../../types/options';
import ComparisonToken, { IComparisonToken } from './base';
import toText from '../../helpers/to-text';

export default class LessThanToken extends ComparisonToken {
    constructor(token: IComparisonToken) {
        super({
            ...token,
            value: 'regex'
        });
    }

    async handle(options: ParserOptions, meta?: any): Promise<boolean> {
        if (this.right == null) {
            // TODO - custom error
            throw new Error('TODO - Evaluation Error: Right hand argument missing');
        }

        let v1 = await this.left.evaluate(options, meta);
        let v2 = await this.right.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        if (v1 == null || typeof v2 !== 'string') {
            return false;
        }

        v1 = toText(v1);
        if (v1 == null) {
            return false;
        }

        v2 = toText(v2);
        if (v2 == null) {
            return false;
        }

        const parts = /^\/(.*)\/([a-z]*)$/i.exec(v2);
        if (parts) {
            return (new RegExp(parts[1], parts[2])).test(v1);
        }
        return (new RegExp(v2)).test(v1);
    }
}