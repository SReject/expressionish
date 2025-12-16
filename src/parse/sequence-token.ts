import type { EvaluateOptions } from '../types';
import type { LookupTokenJSON, IfTokenJSON, VariableTokenJSON, TextTokenJSON, SequenceTokenJSON } from '../tojson-types';

import type { default as TextToken } from './text/token';
import type { default as LookupToken } from './lookup/token';
import type { default as IfToken } from './if/token';
import type { default as VariableToken } from './variable/token';

import BaseToken from './base-token';

export interface SequenceTokenOptions {
    position: number;
}

export default class SequenceToken extends BaseToken {
    tokens : Array<LookupToken | IfToken | VariableToken | TextToken | SequenceToken> = [];

    constructor(options: SequenceTokenOptions) {
        super({
            ...options,
            type: 'LIST'
        });
    }

    add(token: LookupToken | IfToken | VariableToken | TextToken | SequenceToken) {
        if (
            token.type !== 'TEXT' ||
            !this.tokens.length ||
            this.tokens[this.tokens.length - 1].type !== 'TEXT'
        ) {
            this.tokens.push(token);
        } else {
            this.tokens[this.tokens.length - 1].value += (token.value as string);
        }
    }

    get unwrap() : SequenceToken | TextToken | LookupToken | IfToken | VariableToken {
        if (this.tokens.length === 1) {
            return this.tokens[0];
        }
        return this;
    }

    toJSON() : SequenceTokenJSON | LookupTokenJSON | IfTokenJSON | VariableTokenJSON | TextTokenJSON {
        const unwrapped = this.unwrap;
        if (unwrapped !== this) {
            return unwrapped.toJSON();
        }

        return {
            position: this.position,
            type: this.type,
            value: this.tokens.map(token => token.toJSON())
        }
    }

    async evaluate(options: EvaluateOptions) : Promise<unknown> {
        const unwrapped = this.unwrap;
        if (unwrapped !== this) {
            return unwrapped.evaluate(options);
        }

        return (await Promise.all(this.tokens.map(token => token.evaluate(options)))).reduce((prev: string, curr) => {
            if (curr == null) {
                return prev;
            }
            return prev + curr;
        }, '')
    }

}