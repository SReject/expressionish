import { default as Token, IToken } from './base';

export default class TextToken extends Token {
    public value: string;
    constructor(token: IToken) {
        super(token);
    }
}