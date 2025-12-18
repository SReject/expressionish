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

export interface ComparisonTokenOptions {
    position: number;
    value: string;
    left: operand;
    right?: operand;
}

export default class ComparisonToken extends BaseToken {
    value: string;
    left: operand;
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

    toJSON() : ComparisonTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value,
            left:  this.left.toJSON(),
            right: this.right ? this.right.toJSON() : undefined
        };
    }

    async evaluate(options: EvaluateOptions): Promise<unknown> {
        if (!this.value || this.value === '') {
            this.value = 'exists';
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
            return false;
        }

        return operator(left, right);
    }
}