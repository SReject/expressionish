import { type EvaluateOptions } from '../types';

import BaseToken from './base-token';

export interface SequenceTokenOptions {
    position: number;
}

export default class SequenceToken extends BaseToken {
    tokens : BaseToken[] = [];

    constructor(options: SequenceTokenOptions) {
        super({
            ...options,
            type: 'LIST'
        });
    }

    add(token: BaseToken) {
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

    get unwrap() : BaseToken {
        if (!this.tokens.length) {
            return new BaseToken({ position: this.position, type: 'UNDEFINED' });
        }
        if (this.tokens.length === 1) {
            return this.tokens[0];
        }
        return this;
    }

    toJSON() {
        return {
            type: 'SEQUENCE',
            position: this.position,
            value: this.tokens.map(token => token.toJSON())
        }
    }

    async evaluate(options: EvaluateOptions) {
        if (!this.tokens.length) {
            return;
        }

        if (this.tokens.length === 1) {
            return this.tokens[0].evaluate(options);
        }

        return (await Promise.all(this.tokens.map(token => token.evaluate(options)))).reduce((prev: string, curr) => {
            if (curr == null) {
                return prev;
            }
            return prev + curr;
        }, '')
    }

}