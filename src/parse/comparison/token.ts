import type { EvaluateOptions } from '../../types';

import BaseToken from '../base-token';

import operators from './operators';

export interface ComparisonTokenOptions {
    position: number;
    value: string;
    left: BaseToken;
    right?: BaseToken;
}
export default class ComparisonToken extends BaseToken {
    value: string = '';
    left: BaseToken;
    right?: BaseToken;

    constructor(options: ComparisonTokenOptions) {
        super({
            ...options,
            type: 'COMPARISON'
        });
        this.left = options.left;
        this.right = options.right;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            left: this.left.toJSON(),
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