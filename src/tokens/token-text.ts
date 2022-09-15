import TokenType from '../types/token-types';
import Token, { type IToken } from './token';

export interface ITextToken {
    position: number;
    value: string;
}

export default class TextToken extends Token {
    public value: string;
    constructor(token: ITextToken) {
        super({
            ...token,
            type: TokenType.TEXT
        });
    }
}