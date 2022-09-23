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

        if (token.handler != null) {
            if (token.lookupFn != null) {
                throw new Error('TODO - ExpressionError: token contains both lookupFn and handlerFn');
            }
            if (typeof token.handler !== 'object') {
                throw new Error('TODO - ExpressionError: specified handler must be an object');
            }
            if (token.handler.evaluator == null) {
                throw new Error('TODO - ExpressionError: specified handler does not have .evaluator property');
            }
            if (typeof token.handler.evaluator !== 'function') {
                throw new Error('TODO - ExpressionError: specified handler.evaluator property not a function');
            }

        } else if (token.lookupFn == null) {
            throw new Error('TODO - ExpressionError: token info not contain lookupFn or handlerFn');

        } else if (typeof token.lookupFn !== 'function') {
            throw new Error('TODO - ExpressionError: specified lookupFn must be a function');
        }

        super({
            type: TokenType.FUNCTIONAL,
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

        let handler : IFunctionHandler;
        if (this.handler) {
            handler = this.handler;

        } else {
            handler = await this.lookupFn(<string>this.value);
        }

        if (handler == null) {
            throw new Error(`TODO - ExpressionError: No handler for ${this.prefix}${this.value}`);
        }

        const args : unknown[] = [];
        if (this.arguments != null) {
            const argList = this.arguments;
            for (let idx = 0; idx < argList.length; idx += 1) {
                const arg = await argList[idx].evaluate(options, meta);
                args.push(arg);
            }
        }

        if (options.verifyOnly) {
            return;
        }

        if (!options.skipArgumentsCheck && handler.argsCheck != null) {
            try {
                await handler.argsCheck.call(this, meta, args);
            } catch (err) {
                throw new Error(`TODO - ArgumentsError: ${err.message}`);
            }
        }

        return handler.evaluator.call(this, meta, ...args);
    }
}