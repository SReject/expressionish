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

/** Represents the options for a new IfToken instance */
export interface IfTokenOptions {
    /** Position of the if-bloc within the expression*/
    position: number;

    /** The condition of the if-bloc */
    value: ConditionToken;

    /** Token to evaluate if the condition is truthy */
    whenTrue: OperandToken;

    /** Token to evaluate if the condition is not truthy */
    whenFalse?: OperandToken;
}

/** Represents an if token */
export default class IfToken extends BaseToken {

    /** The condition of the if-bloc */
    value: ConditionToken;

    /** Token to evaluate if the condition is truthy */
    whenTrue: OperandToken

    /** Token to evaluate if the condition is not truthy */
    whenFalse?: OperandToken;

    constructor(options: IfTokenOptions) {
        super({
            position: options.position,
            type: 'IF'
        });
        this.value = options.value;
        this.whenTrue = options.whenTrue;
        this.whenFalse = options.whenFalse;
    }

    /** Converts the token to a JSON.stringify()-able object */
    toJSON() : IfTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value.toJSON(),
            whenTrue: this.whenTrue.toJSON(),
            whenFalse: this.whenFalse ? this.whenFalse.toJSON() : undefined
        };
    }

    /** Evaluates the token */
    async evaluate(options: EvaluateOptions): Promise<unknown> {
        const result = await this.value.evaluate(options);
        if (options.onlyValidate) {
            await this.whenTrue.evaluate(options);
            if (this.whenFalse) {
                await this.whenFalse.evaluate(options);
            }
        } else if (result) {
            return this.whenTrue.evaluate(options);
        }
        if (this.whenFalse) {
            return this.whenFalse.evaluate(options);
        }
    }
}