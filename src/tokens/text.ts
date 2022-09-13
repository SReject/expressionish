import { default as Token, IToken } from './base';

export default class TextToken extends Token {
    constructor(token: IToken) {
        super(token);
    }
}