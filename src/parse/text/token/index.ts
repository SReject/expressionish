import type ParserOptions from '../../../types/options';
import TokenType from '../../../types/token-types';

import Token, { type IToken } from '../../token';

export interface ITextToken extends IToken {
    value?: string;
}

export default class TextToken extends Token {
    public value: string;
    constructor(token: ITextToken = {}) {
        if (token.value != null && typeof token.value !== 'string') {
            throw new Error('TODO - ExpressionError: value must be a string');
        }
        super({
            ...token,
            type: TokenType.TEXT,
            value: token.value == null ? '' : token.value
        });
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async evaluate(options: ParserOptions, meta: unknown) : Promise<string> {
        return this.value;
    }
}