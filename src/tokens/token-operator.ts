import ParserOptions from '../types/options';
import TokenType from '../types/token-types';
import Token from './token';

export interface IOperatorToken {
    type: TokenType;
    position: number;
    left: Token;
    right?: Token;
}

export default class OperatorToken extends Token {
    protected left: Token;
    protected right?: Token;

    constructor(token: IOperatorToken) {
        super(token);
        this.left = token.left;
        this.right = token.right;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async evaluate(options: ParserOptions, meta?: any) : Promise<boolean> {
        return false;
    }

    toToken() : object {

        const result : Record<string, object> = {
            ...(super.toToken()),
            left: this.left.toToken()
        }

        if (this.right != null) {
            result.right = this.right.toToken();
        }
        return result;
    }
}