import BaseToken from '../base-token';

import type { TextTokenJSON } from '../../tojson-types';

/** Represents the options for a new TextToken instance */
export interface TextTokenOptions {

    /** Position of the variable within the expression */
    position: number,

    /** The text of the token */
    value: string
}

/** Represents literal text */
export default class TextToken extends BaseToken {

    /** The text of the token */
    value: string;

    constructor(options: TextTokenOptions) {
        super({
            ...options,
            type: 'TEXT'
        });
        this.value = options.value || '';
    }

    /** Converts the token to a JSON.stringify()-able object */
    toJSON() : TextTokenJSON {
        return {
            position: this.position,
            type: this.type,
            value: this.value
        };
    }
}