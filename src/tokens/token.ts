import type ParserOptions from '../types/options';

import TokenType from '../types/token-types';

export interface IToken {
    type?: TokenType;
    position?: number;
    value?: unknown;
}

export default class Token  {

    public type : TokenType;
    public position : number;
    public value : unknown;

    constructor(token: IToken = {}) {
        this.type = token.type == null ? TokenType.UNKNOWN : token.type;
        this.position = token.position != null ? token.position : -1;
        this.value = token.value;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async evaluate(options: ParserOptions, meta: unknown) : Promise<unknown> {
        return this.value == null ? null : this.value;
    }

    toJSON() : Record<string, unknown> {
        return {
            type: this.type,
            position: this.position,
            value: this.value == null ? null : this.value
        };
    }

    toString() : string {
        return JSON.stringify(this.toJSON());
    }
}