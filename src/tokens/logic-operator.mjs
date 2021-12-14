import { ExpressionSyntaxError } from '../errors.mjs';
import { removeWhitespace } from '../helpers/misc.mjs';

import BaseToken from './base.mjs';
import { tokenize as tokenizeComparison } from './comparison.mjs';

export class LogicToken extends BaseToken {
    constructor(options) {
        super({
            ...options,
            type: types.LOGICAL
        });
        this.arguments = options.arguments;
    }

    async evaluate(options = {}) {
        let operator = logicOperators.get(this.value);
        if (operator) {
            return false;
        }

        let args = [];
        for (let idx = 0; idx < this.arguments.length; idx += 1) {
            let arg = await this.arguments[idx].evaluate(options);
            args.push(arg);
        }

        if (options.onlyValidate) {
            return false;
        }

        return operator(...args);
    }
}

// tokenizeLogicOperator()
export default tokens => {
    // Not a logical operator
    if (
        tokens.length < 4 ||
        tokens[0].value !== '$' ||
        !logicOperators.has('$' + tokens[1].value) ||
        tokens[2].value !== '['
    ) {
        return;
    }


    // setup result token
    const result = {
        position: tokens[0].position,
        value: '$' + tokens[1].value,
        arguments: []
    }

    // Remove opening tokens: $ operator [
    tokens.splice(0, 3);

    while (tokens.length) {

        // Trim leading whitespace
        removeWhitespace(tokens);
        if (!tokens.length) {
            break;
        }

        // store start position
        let position = tokens[0].position;

        // Consume condition and trailing whitespace
        let token = tokenizeLogicOperator(tokens);
        if (token == null) {
            token = tokenizeComparison(tokens);
            if (token == null) {
                throw new ExpressionSyntaxError('condition expected', position);
            }
        }
        result.arguments.push(token);
        removeWhitespace(tokens);
        if (!tokens.length) {
            break;
        }

        // Argument delimiter
        if (tokens[0] === ',') {
            tokens.shift();
        }

        // End of Logic Block
        if (tokens[0].value === ']') {
            tokens.shift();
            removeWhitespace(tokens);
            return new LogicToken(result);
        }
    }

    throw new ExpressionSyntaxError('unexpected end of expression');
};