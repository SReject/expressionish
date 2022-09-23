import type IParserOptions from '../types/options';

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

    toJSON() : Record<string, unknown> {

        return {
            type: this.type,
            position: this.position,
            value: this.value
        };
    }

    toString() : string {
        return JSON.stringify(this.toJSON());
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async evaluate(options: IParserOptions, meta: unknown) : Promise<unknown> {
        if (this.type !== TokenType.EMPTY) {
            throw new Error('TODO - ExpressionError: token does not implement evaluate function');
        }
        return;
    }
}