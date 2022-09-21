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
    async evaluate(options: ParserOptions, meta: unknown) : Promise<boolean> {
        return false;
    }

    toJSON() : object {

        const result : Record<string, object> = {
            ...(super.toJSON()),
            left: this.left.toJSON()
        }

        if (this.right != null) {
            result.right = this.right.toJSON();
        }
        return result;
    }
}