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
            type: types.CONDITION,
            ...options
        });
        this.operator = options.operator;
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
        for (let idx = 0; idx < this.arguments.length; idx += 1) {
            args[idx] = await this.arguments[idx].evaluate(options);
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

    const position = tokens[0].position,
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
            whitespace &&
            comparisonOperators.has(tokens[0].value) &&
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
        if (whitespace) {
            if (side.length && side[side.length - 1].type === types.TEXT) {
                side[side.length - 1].value += whitespace;
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