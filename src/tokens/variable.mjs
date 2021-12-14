import { ExpressionVariableError, ExpressionArgumentsError } from '../errors.mjs';

import types from '../helpers/token-types.mjs';

import BaseToken from './base.mjs';
import { default as tokenizeArguments } from './arguments.mjs';

const nameCheck = /^([a-z][a-z\d]+)(.*)$/i;

class VariableToken extends BaseToken {
    constructor(options) {
        super({
            ...options,
            type: types.VARIABLE
        });
        this.arguments = options.arguments;
    }

    async evaluate(options = {}) {
        if (!options.handlers || !options.handlers.has(this.value)) {
            throw new ExpressionVariableError(`unknown variable`, this.position, this.value);
        }

        const variable = options.handlers.get(this.value);

        if (variable.triggers) {
            let trigger = variable.triggers[options.trigger.type],
                display = options.trigger.type ? options.trigger.type.toLowerCase() : "unknown trigger";

            if (trigger == null || trigger === false) {
                throw new ExpressionVariableError(`$${this.value} does not support being triggered by: ${display}`, this.position, this.value);
            }

            if (Array.isArray(trigger)) {
                if (!trigger.some(id => id === options.trigger.id)) {
                    throw new ExpressionVariableError(`$${value} does not support this specific trigger type: ${display}`, this.position, this.value);
                }
            }
        }

        let args = [];
        if (this.arguments && this.arguments.length) {
            for (let idx = 0; idx < this.arguments.length; idx += 1) {
                const parts = this.arguments[idx];
                let accumulator = '';
                for (let partIdx = 0; partIdx < parts.length; partIdx += 1) {
                    let part = await parts[partIdx].evaluate(options);
                    if (part != null) {
                        accumulator += part;
                    }
                }
                args.push(accumulator);
            }
        }
        if (options.onlyValidate) {
            return '';
        }

        try {
            if (variable.argsCheck) {
                await variable.argsCheck(...args);
            }
        } catch (err) {
            throw new ExpressionArgumentsError(err.message, err.position, err.index);
        }
        const result = await variable.evaluator(options.metadata || {}, ...args);
        return result == null ? '' : result;
    }
}

// tokenizeVariable()
export default (output, tokens) => {

    let nameMatch;
    if (
        tokens.length < 2 ||
        tokens[0].value !== '$' ||
        !(nameMatch = nameCheck.exec(tokens[1].value))
    ) {
        return false;
    }
    tokens.shift();

    const token = tokens.shift();

    // trailing character after variable name
    if (nameMatch[2] !== '') {
        tokens.unshift({
            value: nameMatch[2],
            position: token.position + nameMatch[1].length
        });
        token.value = nameMatch[1];
    }

    const args = [];
    if (tokenizeArguments(args, tokens)) {
        token.arguments = args;
    }

    output.push(new VariableToken(token))
    return true;
};