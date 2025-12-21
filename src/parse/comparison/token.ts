import type { EvaluateOptions } from '../../types';
import type { ComparisonTokenJSON } from '../../tojson-types';
import type { default as TextToken } from '../text/token';
import type { default as LookupToken } from '../lookup/token';
import type { default as IfToken } from '../if/token';
import type { default as VariableToken } from '../variable/token';
import type { default as SequenceToken } from '../sequence-token';
type operand = LookupToken | IfToken | VariableToken | TextToken | SequenceToken;

import BaseToken from '../base-token';

import operators from './operators';

/** Represents the options for a new ComparisonToken instance */
export interface ComparisonTokenOptions {

    /** Position of the comparison within the expression */
    position: number;

    /** Comparison operator used */
    value: string;

    /** Left side of comparison */
    left: operand;

    /** Right side of comparison */
    right?: operand;
}

/** Represents a Comparison Token */
export default class ComparisonToken extends BaseToken {

    /** Comparison operator used */
    value: string;

    /** Left side of comparison */
    left: operand;

    /** Right side of comparison */
    right?: operand;

    constructor(options: ComparisonTokenOptions) {
        super({
            ...options,
            type: 'COMPARISON'
        });
        this.value = options.value;
        this.left = options.left;
        this.right = options.right;
    }

    /** Converts the token to a JSON.stringify()-able object */
    toJSON() : ComparisonTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value,
            left:  this.left.toJSON(),
            right: this.right ? this.right.toJSON() : undefined
        };
    }

    /** Evaluates the token */
    async evaluate(options: EvaluateOptions): Promise<unknown> {
        if (!this.value || this.value === '') {
            this.value = 'istruthy';
        }

        const operator = operators.get(this.value);
        if (operator == null) {
            return false;
        }

        const left = await this.left.evaluate(options);

        let right : undefined | unknown;
        if (this.right) {
            right = await this.right.evaluate(options);
        }

        if (options.onlyValidate) {
            return;
        }
        return operator.evaluate(options.data || {}, left, right);
    }
}