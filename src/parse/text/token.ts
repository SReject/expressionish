import BaseToken from '../base-token';

import type { TextTokenJSON } from '../../tojson-types';

export interface TextTokenOptions {
    position: number,
    value: string
}

export default class TextToken extends BaseToken {
    value: string = '';

    constructor(options: TextTokenOptions) {
        super({
            ...options,
            type: 'TEXT'
        });
    }

    toJSON() : TextTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value
        };
    }
}