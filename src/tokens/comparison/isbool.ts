import ParserOptions from '../../types/options';
import ComparisonToken, { IComparisonToken } from './base';

export interface IIsToken extends IComparisonToken {
    against: null | boolean;
}

export default class IsToken extends ComparisonToken {
    public against : null | boolean;

    constructor(token: IIsToken) {
        super({
            ...token,
            value: 'is'
        });

        this.against = token.against;
    }

    async handle(options: ParserOptions, meta?: any): Promise<boolean> {
        let v1 = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        return v1 === this.against;
    }

    toToken(): object {
        return {
            ...(super.toToken()),
            against: this.against
        }
    }
}