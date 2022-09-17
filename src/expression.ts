import type ParserOptions from './types/options';
import TokenType from './types/token-types';

import Token from './tokens/token';

interface IExpression {
    options: ParserOptions;
    value: Token[]
}

export default class Expression extends Token {
    private options: ParserOptions;

    constructor(token: IExpression) {
        super({
            position: 0,
            type: TokenType.EXPRESSION,
            ...token
        });
        this.options = token.options;
    }

    async evaluate(meta: any = {}) : Promise<string> {
        let index = 0;
        let result = '';
        while (index < this.value.length) {
            const value = await this.value[index].evaluate(this.options, meta);
            if (value != null) {
                result += JSON.stringify(value);
            }
            index += 1;
        }
        return '';
    }
}