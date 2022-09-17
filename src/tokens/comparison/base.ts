import ParserOptions from '../../types/options';
import TokenType from '../../types/token-types';

import OperatorToken, { IOperatorToken } from '../token-operator';

export interface IComparisonToken extends IOperatorToken {
    invert?: boolean;
    value: any;
}

export default class ComparisonToken extends OperatorToken {
    protected invert  = false;

    constructor(token: IComparisonToken) {
        super({
            ...token,
            type: TokenType.COMPARISON
        });

        if (token.invert) {
            this.invert = true;
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async handle(options: ParserOptions, meta?: any) : Promise<boolean> {
        return false;
    }

    async handleInverse(options: ParserOptions, meta?: any) : Promise<boolean> {
        const result = await this.handle(options, meta);
        return !result;
    }

    async evaluate(options: ParserOptions, meta?: any) : Promise<boolean> {
        if (this.invert) {
            return this.handleInverse(options, meta);
        }
        return this.handle(options, meta);
    }

    toToken() : object {
        return {
            ...(super.toToken()),
            invert: this.invert
        }
    }
}