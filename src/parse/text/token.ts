import BaseToken from '../base-token';

export interface TextTokenOptions {
    position: number,
    value: string
}
export default class TextToken extends BaseToken {
    constructor(options: TextTokenOptions) {
        super({
            ...options,
            type: 'TEXT'
        });
    }
}