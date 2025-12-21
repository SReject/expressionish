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

/** Represents the options for a new ArgumentsToken instance */
export interface ArgumentsTokenOptions {

    /** Position of the arguments-bloc within the expression */
    position: number;

    /** Tokens contained in the arguments-bloc */
    value?: Array<LookupToken | IfToken | VariableToken | TextToken | SequenceToken | LogicToken | ComparisonToken>
}

/** Represents a list of arguments */
export default class ArgumentsToken extends BaseToken {

    /** Tokens contained in the arguments-bloc */
    value : Array<LookupToken | IfToken | VariableToken | TextToken | SequenceToken | LogicToken | ComparisonToken>;

    constructor(options: ArgumentsTokenOptions) {
        super({
            ...options,
            type: 'ARGUMENTS_LIST'
        });
        this.value = options.value || [];
    }

    /** Converts the token to a JSON.stringify()-able object */
    toJSON() : ArgumentsTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value.map(item => item.toJSON())
        }
    }

    /** Evaluates the token */
    async evaluate(options: EvaluateOptions): Promise<unknown[]> {
        return Promise.all(this.value.map(item => item.evaluate(options)));
    }
}