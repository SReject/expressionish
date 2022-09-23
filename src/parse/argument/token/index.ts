import type IParseOptions from '../../../types/options';
import TokenType from '../../../types/token-types';

import toText from '../../../helpers/to-text';

import Token, { type IToken } from '../../token';

export interface IArgumentToken extends IToken {
    value: Token[];
}

export default class ArgumentToken extends Token {
    public value: Token[];

    constructor(token: IArgumentToken) {

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

        super({
            ...token,
            type: TokenType.ARGUMENT
        });
    }

    toJSON() : Record<string, unknown> {
        return {
            ...(super.toJSON()),
            value: this.value.map(value => value.toJSON())
        };
    }
    async evaluate(options: IParseOptions, meta: unknown) : Promise<unknown> {
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