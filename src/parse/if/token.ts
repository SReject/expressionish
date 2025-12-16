import type { EvaluateOptions } from '../../types';
import type { IfTokenJSON } from '../../tojson-types';
import type ComparisonToken from '../comparison/token';
import type LogicToken from '../logic/token';
import type LookupToken from '../lookup/token';
import type VariableToken from '../variable/token';
import type SequenceToken from '../sequence-token';
import type TextToken from '../text/token';
type ConditionToken = ComparisonToken | LogicToken;
type OperandToken = LookupToken | IfToken | VariableToken | TextToken | SequenceToken;

import BaseToken from '../base-token';

export interface IfTokenOptions {
    position: number;
    value: ConditionToken;
    whenTrue: OperandToken;
    whenFalse?: OperandToken;
}

export default class IfToken extends BaseToken {
    value: ConditionToken;
    whenTrue: OperandToken
    whenFalse?: OperandToken;

    constructor(options: IfTokenOptions) {
        super({
            position: options.position,
            type: 'IF'
        })
        this.value = options.value;
        this.whenTrue = options.whenTrue;
        this.whenFalse = options.whenFalse;
    }

    toJSON() : IfTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value.toJSON(),
            whenTrue: this.whenTrue.toJSON(),
            whenFalse: this.whenFalse ? this.whenFalse.toJSON() : undefined
        };
    }

    async evaluate(options: EvaluateOptions): Promise<unknown> {
        const result = await this.value.evaluate(options);
        if (result) {
            return this.whenTrue.evaluate(options);
        }
        if (this.whenFalse) {
            return this.whenFalse.evaluate(options);
        }
    }
}