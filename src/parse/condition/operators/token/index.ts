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
    arguments: ArgumentsQuantifier;
    defer: boolean;
    cased?: boolean,
    alias: string[];
    inverse?: {
        description: string;
        alias: string[];
        handle: IHandleFn;
    };
    handle: IHandleFn;
}

export interface IOperatorToken extends IToken {
    caseSensitive?: boolean;
    argumentsQuantifier: ArgumentsQuantifier;
    arguments: Token[];
    defer?: boolean;
    handle: IHandleFn;
}

export default class OperatorToken extends Token {
    public caseSensitive : boolean;
    public arguments: Token[];
    public defer: boolean;
    public handle : IHandleFn;

    constructor(token: IOperatorToken) {
        if (token.arguments == null || !Array.isArray(token.arguments)) {
            throw new Error('TODO - ExpressionError - invalid arguments list');
        }
        if (token.arguments.length === 0) {
            throw new Error('TODO - ExpressionError - at least one argument is required');
        }
        if (token.arguments.length > 2) {
            throw new Error('TODO - ExpressionError - too many arguments specified')
        }

        if (token.arguments.length !== 2 && token.argumentsQuantifier === ArgumentsQuantifier.RIGHTREQUIRED) {
            throw new Error('TODO - ExpressionError - right argument required');
        }

        super({
            ...token,
            type: TokenType.OPERATOR
        });

        this.caseSensitive = token.caseSensitive === true;
        this.defer = token.defer === true;
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