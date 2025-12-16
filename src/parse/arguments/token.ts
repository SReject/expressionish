import type { EvaluateOptions } from '../../types';

import BaseToken from '../base-token';
import SequenceToken from '../sequence-token';

export interface ArgumentsTokenOptions {
    position: number;
    value?: Array<BaseToken | SequenceToken>
}
export default class ArgumentsToken extends BaseToken {
    value : Array<BaseToken | SequenceToken> = [];

    constructor(options: ArgumentsTokenOptions) {
        super({
            ...options,
            type: 'ARGUMENTS_LIST'
        });
    }

    toJSON() {
        return {
            position: this.position,
            type: this.type,
            value: this.value.map(item => item.toJSON())
        }
    }

    async evaluate(options: EvaluateOptions): Promise<unknown[]> {
        return Promise.all(this.value.map(item => item.evaluate(options)));
    }
}