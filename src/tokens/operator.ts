import type TokenList from './token-list';
import { ParserOptions } from '../types/options';
import { default as Token, IToken } from './base';

export interface IOperatorToken extends IToken {
    arguments: TokenList
}

export default class OperatorToken extends Token {

    protected arguments : TokenList;

    constructor(token: IOperatorToken) {
        super(token);
        this.arguments = token.arguments;
    }

    async evaluate(options: ParserOptions, meta?: any) : Promise<boolean> {
        return false;
    }

    toToken() : object {
        return {
            ...(super.toToken()),
            arguments: this.arguments.toToken()
        }
    }
}