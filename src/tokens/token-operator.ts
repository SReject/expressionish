import ParserOptions from '../types/options';
import TokenType from '../types/token-types';
import Token, { IToken } from './token';

export interface IOperatorToken extends IToken {
    left?: unknown;
    right?: unknown;
}

export default class OperatorToken extends Token {
    public left?: Token;
    public right?: Token;

    constructor(token: IOperatorToken = {}) {
        super({
            type: TokenType.OPERATOR,
            ...token
        });
        if (token.left != null) {
            this.left = <Token>token.left;
        }
        if (token.right != null) {
            this.right = <Token>token.right;
        }
    }

    toJSON() : Record<string, unknown> {
        const result : Record<string, unknown> = {
            ...(super.toJSON())
        };
        if (this.left != null) {
            result.left = this.left.toJSON();
        }

        if (this.right != null) {
            result.right = this.right.toJSON();
        }
        return result;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async evaluate(options: ParserOptions, meta: unknown) : Promise<boolean> {
        throw new Error('TODO ExpressionError - Operator missing evaluator function');
    }
}