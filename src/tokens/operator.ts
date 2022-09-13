import type TokenList from './token-list';
import { ParserOptions } from '../types/options';
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
        const right : any = this.right;
        return {
            ...(super.toToken()),
            left: this.left,
            right
        }
    }
}