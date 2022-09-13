import { ParserOptions } from '../../types/options';
import { TokenType } from '../../types/token-types';

import { default as OperatorToken, IOperatorToken } from '../operator';

export interface IComparisonToken extends IOperatorToken {
    inverted?: boolean;
}

export default class ComparisonToken extends OperatorToken {
    protected inverted : boolean;

    constructor(token: IComparisonToken) {
        super({
            type: TokenType.COMPARISON,
            ...token
        });

        this.inverted = !!token.inverted;
    }

    async handle(options: ParserOptions, meta?: any) : Promise<boolean> {
        return false;
    }

    async handleInverse(options: ParserOptions, meta?: any) : Promise<boolean> {
        const result = await this.handle(options, meta);
        return !result;
    }

    async evaluate(options: ParserOptions, meta?: any) : Promise<boolean> {
        if (this.inverted) {
            return this.handleInverse(options, meta);
        }
        return this.handle(options, meta);
    }

    toToken() : object {
        return {
            ...(super.toToken()),
            inverted: this.inverted
        }
    }
}