import { ParserOptions } from '../types/options';
import { TokenType } from '../types/token-types';
import { default as Token, IToken } from './base';
import OperatorToken from './operator';

export interface IIfStatementToken extends IToken {
    condition: OperatorToken;
    whenTrue: Token,
    whenFalse?: Token
}

export default class IfStatementToken extends Token {
    protected condition: OperatorToken;
    protected whenTrue: Token;
    protected whenFalse?: Token;

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

    async evaluate(options: ParserOptions, meta?: any) : Promise<any> {
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
        const whenFalse : any = this.whenFalse;
        return {
            ...(super.toToken()),
            condition: this.condition.toToken(),
            whenTrue: this.whenTrue.toToken(),
            whenFalse
        }
    }
}