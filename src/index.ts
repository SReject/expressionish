import has from './helpers/has';

import IParseOptions from './types/options';

import {
    type default as ParserOptions,
    type IFunctionHandler,
    type IFunctionLookup
} from './types/options';

import Expression from './parse/expression';
import tokenize from './parse';

export {
    ExpressionError,
    ExpressionArgumentsError,
    ExpressionSyntaxError,
    ExpressionVariableError
} from './errors';

export class Expressionish {
    private functionHandlers : Record<string, IFunctionHandler>;
    private functionLookups : Record<string, IFunctionLookup>;

    private config: ParserOptions;

    constructor(options: ParserOptions = {}) {
        this.functionHandlers = options.functionHandlers || {};
        this.functionLookups = options.functionLookups || {};

        this.config = {
            "if": options.if || true,
            eol: options.eol || 'keep',
            specialSequences: options.specialSequences || true
        };
    }

    registerFunction(name: string, handler: IFunctionHandler) : void {
        name = name.toLowerCase();
        if (has(this.functionHandlers, name)) {
            throw new Error(`'$${name}' already registered`);
        }
        this.functionHandlers[name] = handler;
    }

    unregisterFunction(name: string, handler: IFunctionHandler) : void {
        name = name.toLowerCase();
        if (has(this.functionHandlers, name) && this.functionHandlers[name] === handler) {
            delete this.functionHandlers[name];
        }
    }

    registerLookup(prefix: string, handler: IFunctionLookup) : void {
        prefix = prefix.toLowerCase();
        if (has(this.functionLookups, prefix)) {
            throw new Error(`prefix '$${prefix}' already registered`);
        }
        this.functionLookups[prefix] = handler;
    }

    unregisterLookup(prefix: string, handler: IFunctionLookup) : void {
        prefix = prefix.toLowerCase();
        if (has(this.functionLookups, prefix) && this.functionLookups[prefix] === handler) {
            delete this.functionLookups[prefix];
        }
    }

    async tokenize(subject: string) : Promise<Expression> {
        const config : IParseOptions = {
            functionHandlers: { ...(this.functionHandlers) },
            functionLookups:  { ...(this.functionLookups) },
            ...(this.config)
        }
        return tokenize(config, subject);
    }

    static async tokenize(subject: string, options?: ParserOptions) : Promise<Expression> {
        return tokenize({
            functionHandlers: {},
            functionLookups: {},
            "if": true,
            eol: 'keep',
            specialSequences: true,
            ...options
        }, subject);
    }

    static async evaluate(subject: string, meta: unknown = {}, options?: ParserOptions) : Promise<string> {
        const expression = await tokenize({
            functionHandlers: {},
            functionLookups: {},
            "if": true,
            eol: 'keep',
            specialSequences: true,
            ...options
        }, subject);
        return expression.evaluate(meta);
    }
}