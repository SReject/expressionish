import TokenType from '../types/token-types';
import ParserOptions from '../types/options';

import Token from './token';
import OperatorToken from './token-operator';

export interface IIfStatementToken {
    position: number;
    condition: OperatorToken;
    whenTrue: Token,
    whenFalse?: Token
}

export default class IfStatementToken extends Token {
    public condition: OperatorToken;
    public whenTrue: Token;
    public whenFalse?: Token;

    constructor(token: IIfStatementToken) {
        super({
            ...token,
            type: TokenType.IFSTATEMENT,
            value: 'if'
        });
        this.condition = token.condition;
        this.whenTrue = token.whenTrue;
        this.whenFalse = token.whenFalse;
    }

    async evaluate(options: ParserOptions, meta: unknown) : Promise<unknown> {
        const res = await this.condition.evaluate(options, meta);

        if (options.verifyOnly) {
            await this.whenTrue.evaluate(options, meta);
            if (this.whenFalse != null) {
                await this.whenFalse.evaluate(options, meta);
            }
            return;
        }

        if (res != null && res !== false) {
            return this.whenTrue.evaluate(options, meta);
        }

        if (this.whenFalse != null) {
            return this.whenFalse.evaluate(options, meta);
        }
    }

    toToken() : object {
        return {
            ...(super.toJSON()),
            condition: this.condition.toJSON(),
            whenTrue: this.whenTrue.toJSON(),
            whenFalse: this.whenFalse?.toJSON()
        }
    }
}