import types from '../helpers/token-types.mjs';
import { removeWhitespace } from '../helpers/misc.mjs';

import { ExpressionSyntaxError } from '../errors.mjs';

import BaseToken from './base.mjs';
import { default as tokenizeComparison } from './comparison.mjs';
import { default as tokenizeArguments } from './arguments.mjs';

export class IfToken extends BaseToken {
    constructor(options) {
        super({
            type: types.IF,
            ...options
        });
        this.condition = options.condition;
        this.arguments = options.arguments;
    }

    async evaluate(options = {}) {
        let result = this.condition.evaluate(options);
        if (options.onlyValidate) {
            await this.arguments[0].evaluate(options);
            if (this.arguments[1]) {
                await this.arguments[1].evaluate(options);
            }
            return '';
        }

        if (result) {
            return await this.arguments[0].evaluate(options);
        } else if (this.arguments[1] != null) {
            return await this.arguments[1].evaluate(options);
        } else {
            return '';
        }
    }
}

// tokenizeIf();
export default (output, tokens) => {

    // not an $if[ token
    if (
        !tokens.length ||
        tokens.length < 3 ||
        tokens[0].value !== '$' ||
        tokens[1].value !== 'if' ||
        tokens[2].value !== '['
    ) {
        return false;
    }

    const position = tokens[0].position;
    const args = [];

    // remove opening tokens
    tokens.splice(0, 2);

    // Save opening bracket token
    const openToken = tokens.shift();
    if (openToken.value !== '[') {
        throw new ExpressionSyntaxError('$if requires atleast 2 arguments', token.position);
    }
    removeWhitespace(tokens);

    // Consume condition and delimiter(,)
    let condition = tokenizeComparison(tokens);
    if (!condition) {
        throw new ExpressionSyntaxError('$if requires the first argument to be a conditional', openToken.position + 1);
    }
    if (!tokens.length) {
        throw new ExpressionSyntaxError('unexpected end of expression');
    }
    if (tokens[0].value !== ',') {
        throw new ExpressionSyntaxError('expected comma delimiter after condition', tokens[0].position);
    }
    tokens.shift();
    removeWhitespace(tokens);

    // Re-add opening bracket token so tokenizeArguments() can be used to finish parsing the $if[]
    tokens.unshift(openToken);
    tokenizeArguments(args, tokens);

    // check result
    if (args.length < 1) {
        throw new ExpressionSyntaxError('$if requires at least 2 arguments', openToken.position);
    }
    if (args.length > 2) {
        throw new ExpressionSyntaxError('$if requires at most 3 arguments', args[3].position);
    }

    output.push(new IfToken({
        position,
        condition,
        arguments: args
    }));
    return true;
}