import { type EvaluateOptions } from '../types';

export interface BaseTokenOptions {
    position: number,
    type?: string,
    value?: unknown
}

export interface BaseTokenJSON {
    position: number,
    type: string,
    value?: unknown
}

export default class BaseToken {
    position: number;
    type: string;
    value?: unknown;

    constructor(options: BaseTokenOptions) {
        this.position = options.position;
        this.type = options.type || 'UNKNOWN';
        this.value = options.value;
    }

    toJSON() : BaseTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value
        };
    }

    async evaluate(options: EvaluateOptions) : Promise<unknown> {
        if (options.onlyValidate) {
            return;
        }
        return this.value;
    }
}