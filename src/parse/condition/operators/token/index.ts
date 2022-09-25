import type IParseOptions from '../../../../types/options';
import TokenType from '../../../../types/token-types';

import { default as Token, type IToken } from '../../../token';

interface IHandleStateBase {
    caseSensitive: boolean;
}
interface IHandleStateNotDeferred extends IHandleStateBase {
    left: unknown;
    right?: unknown;
    arguments?: never;
}
export interface IHandleStateDeferred extends IHandleStateBase {
    left?: never;
    right?: never;
    arguments: Token[]
}
export type IHandleState = IHandleStateNotDeferred | IHandleStateDeferred;

export const enum ArgumentsQuantifier {
    LEFTONLY,
    RIGHTOPTIONAL,
    RIGHTREQUIRED
}

export type IHandleFn = (options: IParseOptions, meta: unknown, state: IHandleState) => Promise<boolean | undefined>;

export interface IOperator {
    name: string;
    description: string;
    quantifier: ArgumentsQuantifier;
    defer?: boolean;
    cased?: boolean,
    alias: string[];
    inverse?: {
        description: string;
        alias: string[];
        handle?: IHandleFn;
    };
    handle: IHandleFn;
}

export interface IOperatorToken extends IToken {
    caseSensitive?: boolean;
    quantifier: ArgumentsQuantifier;
    arguments: Token[];
    defer?: boolean;
    handle: IHandleFn;
}

export default class OperatorToken extends Token {
    public quantifier: ArgumentsQuantifier;
    public arguments: Token[];
    public defer: boolean;
    public caseSensitive : boolean;
    public handle : IHandleFn;

    constructor(token: IOperatorToken) {
        if (token == null) {
            throw new Error('TODO - ExpressionError: token must not be nullish');
        }

        if (token.quantifier == null) {
            throw new Error('TODO - ExpressionError: arguments quantifier not specified');
        }
        if (!Number.isFinite(token.quantifier)) {
            throw new Error('TODO - ExpressionError: must be a number');
        }

        if (token.arguments == null) {
            throw new Error('TODO - ExpressionError: arguments list not specified');
        }
        if (!Array.isArray(token.arguments)) {
            throw new Error('TODO - ExpressionError: arguments list must be an array')
        }
        if (token.arguments.length === 0) {
            throw new Error('TODO - ExpressionError: at least one argument is required');
        }
        if (token.arguments.length > 2) {
            throw new Error('TODO - ExpressionError: too many arguments specified')
        }
        if (token.arguments.length !== 2 && token.quantifier === ArgumentsQuantifier.RIGHTREQUIRED) {
            throw new Error('TODO - ExpressionError: right argument required');
        }

        if (token.defer != null && token.defer !== false && token.defer !== true) {
            throw new Error('TODO - ExpressionError: if specified defer must be boolean');
        }

        if (token.caseSensitive != null && token.caseSensitive !== false && token.caseSensitive !== true) {
            throw new Error('TODO - ExpressionError: if specified caseSensitive must be boolean');
        }

        if (token.handle == null) {
            throw new Error('TODO - ExpressionError: handle function not specified');
        }
        if (
            typeof token.handle !== 'function' &&
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            <any>token.handle instanceof Function
        ) {
            throw new Error('TODO - ExpressionError: specified handle must be a function');
        }

        super({
            ...token,
            type: TokenType.OPERATOR
        });

        this.quantifier = token.quantifier;
        this.arguments = [ ...(token.arguments) ];
        this.defer = token.defer === true;
        this.caseSensitive = token.caseSensitive === true;
        this.handle = token.handle;
    }

    toJSON() : Record<string, unknown> {
        return {
            ...(super.toJSON()),
            caseSensitive: this.caseSensitive,
            arguments: this.arguments.map(token => token.toJSON())
        };
    }

    async evaluate(options: IParseOptions, meta: unknown): Promise<unknown> {
        if (this.defer) {
            if (options.verifyOnly) {
                await this.arguments[0].evaluate(options, meta);
                if (this.arguments.length > 1) {
                    await this.arguments[1].evaluate(options, meta);
                }
                return false;
            }

            return await this.handle.call(this, options, meta, {caseSensitive: this.caseSensitive, arguments: this.arguments});
        }

        const left = await this.arguments[0].evaluate(options, meta);

        let right: unknown;
        if (this.arguments.length > 1) {
            right = await this.arguments[1].evaluate(options, meta);
        }

        if (options.verifyOnly) {
            return false;
        }

        return true === await this.handle.call(this, options, meta, {left, right, caseSensitive: this.caseSensitive});
    }
}