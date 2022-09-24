import TokenType from '../../../types/token-types';
import type IParserOptions from '../../../types/options';

import Token from '../../token';

import { OperatorToken } from '../../condition';

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
        if (token == null) {
            throw new Error('TODO - ExpressionError: token not specified');
        }
        if (typeof token !== 'object') {
            throw new Error('TODO - ExpressionError: token must be an object');
        }
        if (token.condition == null) {
            throw new Error('TODO - ExpressionError: condition not specified');
        }
        if (!(token.condition instanceof OperatorToken)) {
            throw new Error('TODO - ExpressionError: condition must be an instance of OperatorToken');
        }
        if (token.whenTrue == null) {
            throw new Error('TODO - ExpressionError: truthy argument must be specified');
        }
        if (!(token.whenTrue instanceof Token)) {
            throw new Error('TODO - ExpressionError: truthy argument must be a token instance');
        }
        if (token.whenFalse !== null && !(token.whenFalse instanceof Token)) {
            throw new Error('TODO - ExpressionError: falsy argument must be a token instance');
        }

        super({
            ...token,
            type: TokenType.IFSTATEMENT,
            value: 'if'
        });
        this.condition = token.condition;
        this.whenTrue = token.whenTrue;
        this.whenFalse = token.whenFalse;
    }

    toTJSON() : object {
        return {
            ...(super.toJSON()),
            condition: this.condition.toJSON(),
            whenTrue: this.whenTrue.toJSON(),
            whenFalse: this.whenFalse?.toJSON()
        }
    }

    async evaluate(options: IParserOptions, meta: unknown) : Promise<unknown> {
        if (options == null) {
            options = {};
        }

        if (meta == null) {
            meta = {};
        }

        const res = await this.condition.evaluate(options, {...(<object>meta) });

        if (options.verifyOnly) {
            await this.whenTrue.evaluate(options, {...(<object>meta) });

            if (this.whenFalse != null) {
                await this.whenFalse.evaluate(options, {...(<object>meta) });
            }
            return;
        }

        if (res != null && res !== false) {
            return this.whenTrue.evaluate(options, {...(<object>meta) });
        }

        if (this.whenFalse != null) {
            return this.whenFalse.evaluate(options, {...(<object>meta) });
        }
    }
}