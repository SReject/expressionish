import types from '../helpers/token-types.mjs';

export default class Token {

    constructor({type, position, value}) {
        this.type = type || types.UNKNOWN;
        this.position = position == null ? -1 : position;
        if (value != null) {
            this.value = value;
        }
    }

    evaluate() {
        return this.value == null ? '' : this.value;
    }
}