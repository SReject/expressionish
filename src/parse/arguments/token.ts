import type { EvaluateOptions } from '../../types';
import type { ArgumentsTokenJSON } from '../../tojson-types';
import type ComparisonToken from '../comparison/token';
import type IfToken from '../if/token';
import type LogicToken from '../logic/token';
import type LookupToken from '../lookup/token';
import type TextToken from '../text/token';
import type VariableToken from '../variable/token';

import BaseToken from '../base-token';
import SequenceToken from '../sequence-token';

export interface ArgumentsTokenOptions {
    position: number;
    value?: Array<LookupToken | IfToken | VariableToken | TextToken | SequenceToken | LogicToken | ComparisonToken>
}

export default class ArgumentsToken extends BaseToken {
    value : Array<LookupToken | IfToken | VariableToken | TextToken | SequenceToken | LogicToken | ComparisonToken> = [];

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