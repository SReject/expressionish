import TokenType from '../../../types/token-types';
import { type default as IParserOptions, type IFunctionLookup, type IFunctionHandler } from '../../../types/options';
import Token, { type IToken } from '../../token';

interface IFunctionBaseToken extends IToken {
    prefix: string;
    value: string;
    arguments: Token[];
}

export interface IFunctionHandlerToken extends IFunctionBaseToken {
    handler: IFunctionHandler;
    lookupFn?: never;
}

interface IFunctionLookupToken extends IFunctionBaseToken {
    handler?: never;
    lookupFn: IFunctionLookup;
}

export type IFunctionToken = IFunctionHandlerToken | IFunctionLookupToken;

export default class FunctionToken extends Token {
    public prefix: string;
    public value: string;
    public arguments: Token[];
    public handler: IFunctionHandler;
    public lookupFn: IFunctionLookup;

    constructor(token: IFunctionToken) {

        if (token == null) {
            throw new Error('TODO - ExpressionError: token info missing')
        }
        if (typeof token !== 'object') {
            throw new Error('TODO - ExpressionError: token must be an object');
        }
        if (typeof token.prefix !== 'string') {
            throw new Error('TODO - ExpressionError: token contains invalid prefix');
        }

        if (typeof token.value !== 'string') {
            throw new Error('TODO - ExpressionError: token.value must be a string');
        }

        if (!Array.isArray(token.arguments)) {
            throw new Error('TODO - ExpressionError: token info contains invalid arguments')
        }

        if (!token.arguments.length) {
            throw new Error('TODO - ExpressionError: token info arguments is unpopulated array')
        }

        if (token.arguments.some((value: unknown) => !(value instanceof Token))) {
            throw new Error('arguments must be a list of tokens');
        }

        if (token.handler == null && token.lookupFn == null) {
            throw new Error('TODO - ExpressionError: token info not contain lookupFn or handlerFn');

        } else if (token.handler != null) {
            if (token.lookupFn != null) {
                throw new Error('TODO - ExpressionError: token contains both lookupFn and handlerFn');
            }

            const handler : IFunctionHandler = token.handler;
            if (typeof handler !== 'object') {
                throw new Error('TODO - ExpressionError: specified handler must be an object');
            }
            if (handler.evaluate == null) {
                throw new Error('TODO - ExpressionError: specified handler does not have .evaluator property');
            }
            if (typeof handler.evaluate !== 'function') {
                throw new Error('TODO - ExpressionError: specified handler.evaluator property not a function');
            }
            if (handler.stackCheck != null && typeof handler.stackCheck !== 'function') {
                throw new Error('TODO - ExpressionError: stackCheck must be a function');
            }
            if (handler.argsCheck != null && typeof handler.argsCheck !== 'function') {
                throw new Error('TODO - ExpressionError: argsCheck must be a function');
            }

        } else if (typeof token.lookupFn !== 'function') {
            throw new Error('TODO - ExpressionError: specified lookupFn must be a function');
        }

        super({
            type: TokenType.FUNCTION,
            ...token
        });
        this.prefix = '' + token.prefix;
        this.arguments = token.arguments;

        if (token.handler != null) {
            this.handler = token.handler;

        } else {
            this.lookupFn = token.lookupFn;
        }
    }

    toJSON() : Record<string, unknown> {
        return {
            ...(super.toJSON()),
            prefix: this.prefix,
            arguments: this.arguments.map(value => value.toJSON())
        }
    }

    async evaluate(options: IParserOptions, meta: unknown) : Promise<unknown> {
        if (options == null) {
            options = {};
        }
        if (meta == null) {
            meta = {};
        }
        if (options.stack == null) {
            options.stack = [];
        }
        const stack = [ ...options.stack ]

        let handler : IFunctionHandler;
        if (this.handler) {
            handler = this.handler;

        } else {
            handler = await this.lookupFn(<string>this.value);
        }

        if (handler == null) {
            throw new Error(`TODO - ExpressionError: No handler for ${this.prefix}${this.value}`);
        }

        if (!options.skipStackCheck && handler.stackCheck != null) {
            try {
                await handler.stackCheck.call(this, options, meta, stack);
            } catch (err) {
                throw new Error('TODO - ExpressionError: stack check failed')
            }
        }

        let args : unknown[] = [];
        if (!options.verifyOnly && handler.defer === true) {
            args = this.arguments;

        } else if (this.arguments != null) {
            const argList = this.arguments;
            for (let idx = 0; idx < argList.length; idx += 1) {
                const opts = {
                    ...options,
                    stack: [...(options.stack), `${this.prefix}${this.value}`]
                }
                const arg = await argList[idx].evaluate(opts, meta);
                args.push(arg);
            }
        }

        if (options.verifyOnly) {
            return;
        }

        if (
            !options.skipArgumentsCheck &&
            handler.defer !== true &&
            handler.argsCheck != null
        ) {
            try {
                await handler.argsCheck.call(this, options, meta, args);
            } catch (err) {
                throw new Error(`TODO - ArgumentsError: ${err.message}`);
            }
        }

        return handler.evaluate.call(this, options, meta, ...args);
    }
}