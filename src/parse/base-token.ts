import { type EvaluateOptions } from '../types';

/** Represents the base options for all Token instances */
export interface BaseTokenOptions {
    position: number,
    type?: string,
    value?: unknown
}

/** Represents the base return value for all Token instance .toJSON() functions */
export interface BaseTokenJSON {
    position: number,
    type: string,
    value?: unknown
}

/** The most basic token; should not be used externally */
export default class BaseToken {

    /** Position in the expression where the token occurs */
    position: number;

    /** Token type */
    type: string;

    /** Token value */
    value?: unknown;

    constructor(options: BaseTokenOptions) {
        this.position = options.position;
        this.type = options.type || 'UNKNOWN';
        this.value = options.value;
    }

    /** Converts the token to a JSON.stringify()-able object */
    toJSON() : BaseTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value
        };
    }

    /** Evaluates the token */
    async evaluate(options: EvaluateOptions) : Promise<unknown> {
        if (options.onlyValidate) {
            return;
        }
        return this.value;
    }
}