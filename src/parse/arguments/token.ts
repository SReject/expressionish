import type { EvaluateOptions } from '../../types';
import type { ArgumentsTokenJSON } from '../../tojson-types';

import BaseToken from '../base-token';
import SequenceToken from '../sequence-token';

import type { default as TextToken } from '../text/token';
import type { default as LookupToken } from '../lookup/token';
import type { default as IfToken } from '../if/token';
import type { default as VariableToken } from '../variable/token';

export interface ArgumentsTokenOptions {
    position: number;
    value?: Array<LookupToken | IfToken | VariableToken | TextToken | SequenceToken>
}

export default class ArgumentsToken extends BaseToken {
    value : Array<LookupToken | IfToken | VariableToken | TextToken | SequenceToken> = [];

    constructor(options: ArgumentsTokenOptions) {
        super({
            ...options,
            type: 'ARGUMENTS_LIST'
        });
    }

    toJSON() : ArgumentsTokenJSON {
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