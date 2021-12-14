import types from '../helpers/token-types.mjs';

import { removeWhitespace } from "../helpers/misc.mjs";
import operators from '../operators/compare.mjs';

import BaseToken from "./base.mjs";
import { default as tokenizeVariable } from './variable.mjs';
import { default as tokenizeIf } from './if.mjs';
import {
    TextToken,
    tokenizeEscape,
    tokenizeQuote
} from './text.mjs';

export class ComparisonToken extends BaseToken {

    constructor(options) {
        super({
            ...options,
            type: types.CONDITION
        });
        this.arguments = options.arguments;
    }

    async evaluate(options) {
        if (!this.value) {
            this.value = 'exists';
        }
        const operator = operators.get(this.value);

        if (operator == null) {
            return false;
        }

        let args = [];
        if (this.arguments && this.arguments.length) {
            for (let idx = 0; idx < this.arguments.length; idx += 1) {
                let accumulator = '';
                const parts = this.arguments[idx];
                for (let partsIdx = 0; partsIdx < parts.length; partsIdx += 1) {
                    let res = await parts[partsIdx].evaluate(options);
                    if (res != null) {
                        accumulator += res;
                    }
                }
                args.push(accumulator);
            }
        }

        if (options.onlyValidate) {
            return false;
        }

        return operator(...args);
    }
}

// tokenizeComparison()
export default (tokens) => {

    // nothing to consume
    if (!tokens.length || tokens[0].value === ',' || tokens[0].value === ']') {
        return;
    }

    const leadingWs = removeWhitespace(tokens),
        position = tokens[0].position,
        left = [],
        right = [];

    let value;
    while (tokens.length) {
        const pos = tokens[0].position,
            ws = removeWhitespace(tokens);

        // end of condition block
        if (!tokens.length || tokens[0].value === ',' || tokens[0].value === ']') {
            break;
        }

        // consume operator: must be prefixed with whitespace and suffixed with whitespace or end-of-conditional
        if (
            value == null &&
            (leadingWs || ws) &&
            operators.has(tokens[0].value) &&
            (
                !tokens[1] ||
                tokens[1].value === ' ' ||
                tokens[1].value === ',' ||
                tokens[1].value === ']'
            )
        ) {
            value = tokens[0].value;
            tokens.shift();
            removeWhitespace(tokens);
            continue;
        }

        const side = value == null ? left : right;

        // Add whitespace to side token array
        if (ws) {
            if (side.length && side[side.length - 1].type === types.TEXT) {
                side[side.length - 1].value += ws;
            } else {
                side.push(new TextToken({value: ws, position: pos}));
            }
        }

        if (tokenizeEscape(side, tokens)) {
            continue;
        }

        if (tokenizeQuote(side, tokens)) {
            continue;
        }

        if (tokenizeIf(side, tokens)) {
            continue;
        }

        if (tokenizeVariable(side, tokens)) {
            continue;
        }

        // Treat all other tokens as plain text
        const token = tokens.shift();
        if (side.length && side[side.length - 1].type === types.TEXT) {
            side[side.length - 1].value += token.value;
        } else {
            side.push(new TextToken(token));
        }
    }

    return new ComparisonToken({
        position,
        value,
        arguments: [left, right]
    });
};