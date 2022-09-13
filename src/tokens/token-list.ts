import TokenType from '../types/token-types';
import ParserOptions from '../types/options';

import toText from '../helpers/to-text';

import { default as Token, IToken } from './base';

export interface ITokenList extends IToken {
    value: Token[];
}

export default class TokenList extends Token {
    public value : Token[];

    constructor(token: ITokenList) {
        super({
            ...token,
            type: TokenType.TOKENLIST
        });
    }

    async evaluate(options: ParserOptions, meta?: any): Promise<any> {
        const parts = this.value;

        let res : any;
        for (let idx = 0; idx < parts.length; idx += 1) {
            let value = await parts[idx].evaluate(options, meta);

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

            let strValue = toText(value);
            if (strValue == null) {
                continue;
            }

            if (typeof res !== 'string') {
                let strRes = toText(res);
                if (strRes == null) {
                    res = value;
                } else {
                    res = strRes + strValue;
                }
                continue;
            }

            res += strValue;
        }

        return res;
    }

    toToken() : object {
        return {
            ...(super.toToken()),
            value: this.value.map(value => value.toToken())
        };
    }
}