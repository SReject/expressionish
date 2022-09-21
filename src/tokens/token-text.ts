import type ParserOptions from '../types/options';
import TokenType from '../types/token-types';

import Token from './token';

export interface ITextToken {
    position?: number;
    value?: string;
}

export default class TextToken extends Token {
    public value: string;
    constructor(token: ITextToken = {}) {
        super({
            ...token,
            type: TokenType.TEXT,
            value: token.value == null ? '' : token.value
        });
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async evaluate(options: ParserOptions, meta: unknown) : Promise<string> {
        return this.value == null ? '' : this.value;
    }
}