import ParserOptions from '../types/options';
import { default as Token, IToken } from './base';

export interface IOperatorToken extends IToken {
    left: Token,
    right?: Token
}

export default class OperatorToken extends Token {
    protected left: Token;
    protected right?: Token;

    constructor(token: IOperatorToken) {
        super(token);
        this.left = token.left;
        this.right = token.right;
    }

    async evaluate(options: ParserOptions, meta?: any) : Promise<boolean> {
        return false;
    }

    toToken() : object {

        let result : Record<string, object> = {
            ...(super.toToken()),
            left: this.left.toToken()
        }

        if (this.right != null) {
            result.right = this.right.toToken();
        }
        return result;
    }
}