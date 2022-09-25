import TokenType from '../../types/token-types';
import type IParserOptions from '../../types/options';

import toText from '../../helpers/to-text';

import Token, { type IToken } from '../token';

export interface IListToken extends IToken {
    value: Token[];
}

export default class ListToken extends Token {
    public value : Token[];

    constructor(token: IListToken) {
        if (token == null) {
            throw new Error('TODO - ExpressionError: token not specified');
        }
        if (typeof token !== 'object') {
            throw new Error('TODO - ExpressionError: token must be an object');
        }
        if (token.value == null) {
            throw new Error('TODO - ExpressionError: token list not specified');
        }
        if (!Array.isArray(token.value)) {
            throw new Error('TODO - ExpressionError: token list must be an array')
        }

        for (let idx = 0; idx < token.value.length; idx += 1) {
            if (!(token.value[idx] instanceof Token)) {
                throw new Error('value list must contain only tokens');
            }
        }

        super({
            ...token,
            type: TokenType.LIST
        });
    }

    toJSON() : Record<string, unknown> {
        return {
            ...(super.toJSON()),
            value: this.value.map(value => value.toJSON())
        };
    }

    async evaluate(options: IParserOptions, meta: unknown): Promise<unknown> {
        if (options == null) {
            options = {};
        }
        if (meta == null) {
            meta = {};
        }

        const parts = this.value;

        let res : unknown;
        for (let idx = 0; idx < parts.length; idx += 1) {
            const value = await parts[idx].evaluate(options, meta);

            if (options.verifyOnly) {
                continue;
            }

            if (value === undefined) {
                continue;
            }

            if (res == null) {
                res = value;
                continue;
            }

            const strValue = toText(value);
            if (strValue == null) {
                continue;
            }

            if (typeof res !== 'string') {
                const strRes = toText(res);
                if (strRes == null) {
                    res = strValue;

                } else {
                    res = <string>strRes + <string>strValue;
                }
                continue;
            }

            res += strValue;
        }

        return res;
    }
}