import TokenType from '../types/token-types';

export interface IToken {
    type: TokenType;
    position: number;
    value?: any;
}

export default class Token  {

    public type: TokenType;
    public position : number;
    public value : any;

    constructor(token: IToken) {
        this.type = token.type == null ? TokenType.UNKNOWN : token.type;
        this.position = token.position != null ? token.position : -1;
        this.value = token.value;
    }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    async evaluate(options: any, meta?: any) : Promise<any> {
        return this.value == null ? '' : this.value;
    }

    toString() : string {
        return JSON.stringify(this.toToken());
    }

    toToken() : object {
        return {
            type: this.type,
            position: this.position,
            value: this.value
        };
    }
}