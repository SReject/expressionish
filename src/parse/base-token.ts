import { type EvaluateOptions } from '../types';

export interface BaseTokenOptions {
    position: number,
    type?: string,
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

    toJSON() {
        return {
            position: this.position,
            type: this.type,
            value: this.value
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async evaluate(options: EvaluateOptions) : Promise<unknown> {
        return this.value;
    }
}