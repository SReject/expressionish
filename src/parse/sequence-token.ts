import type { EvaluateOptions } from '../types';
import type { LookupTokenJSON, IfTokenJSON, VariableTokenJSON, TextTokenJSON, SequenceTokenJSON } from '../tojson-types';

import type { default as TextToken } from './text/token';
import type { default as LookupToken } from './lookup/token';
import type { default as IfToken } from './if/token';
import type { default as VariableToken } from './variable/token';

import BaseToken from './base-token';

export interface SequenceTokenOptions {
    position: number;
    value?: LookupToken | IfToken | VariableToken | TextToken | SequenceToken
}

export default class SequenceToken extends BaseToken {
    value : Array<LookupToken | IfToken | VariableToken | TextToken | SequenceToken>;

    constructor(options: SequenceTokenOptions) {
        super({
            ...options,
            type: 'LIST'
        });
        this.value = [];
    }

    add(token: LookupToken | IfToken | VariableToken | TextToken | SequenceToken) {
        if (
            token.type !== 'TEXT' ||
            !this.value.length ||
            this.value[this.value.length - 1].type !== 'TEXT'
        ) {
            this.value.push(token);
        } else {
            this.value[this.value.length - 1].value += (token.value as string);
        }
    }

    get unwrap() : SequenceToken | TextToken | LookupToken | IfToken | VariableToken {
        if (this.value.length === 1) {
            return this.value[0];
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
            value: this.value.map(token => token.toJSON())
        }
    }

    async evaluate(options: EvaluateOptions) : Promise<unknown> {
        if (this.value == null || this.value.length === 0) {
            return;
        }
        if (this.value.length === 1) {
            return this.value[0].evaluate(options);
        }

        return (await Promise.all(this.value.map(token => token.evaluate(options)))).reduce((prev: unknown, curr) => {
            if (prev == null) {
                return curr;
            }
            if (curr == null) {
                return prev;
            }
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (prev as any) + (curr as any);
        })
    }

}