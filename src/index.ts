import has from './helpers/has';
import getPotentialTokens from './helpers/get-potential-tokens';

import {
    type default as ParserOptions,
    type IFunctionHandler,
    type IFunctionLookup
} from './types/options';
import TokenType from './types/token-types';
import ITokenizeState from './types/tokenize-state';

import Token from './tokens/token';
import TextToken from './tokens/token-text';

import tokenizeTextEscapeSingle from './tokenize/text-escape-single';
import tokenizeTextEscapeBlock from './tokenize/text-escape-block';
import tokenizeTextQuoted from './tokenize/text-quoted';
import tokenizeTextSpecial from './tokenize/text-special';
import tokenizeFunctionIf from './tokenize/function-if';
import tokenizeFunction from './tokenize/function';

import Expression from './expression';

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

    constructor(options?: ParserOptions) {
        this.functionHandlers = options.functionHandlers || {};
        this.functionLookups = options.functionLookups || {};

        this.config = {
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
        let tokens = getPotentialTokens(
            this.config,
            subject
        );
        let cursor = 0;

        const result : Token[] = [];

        while (cursor < tokens.length) {

            const mockState : ITokenizeState = {
                options: {
                    ...(this.config),
                    functionHandlers: { ...(this.functionHandlers) },
                    functionLookups: { ...(this.functionLookups)}
                },
                tokens: [...tokens],
                cursor,
                stack: []
            };

            if (
                await tokenizeTextEscapeSingle(mockState) ||
                await tokenizeTextEscapeBlock(mockState) ||
                await tokenizeTextQuoted(mockState) ||
                await tokenizeTextSpecial(mockState) ||
                await tokenizeFunctionIf(mockState) ||
                await tokenizeFunction(mockState)
            ) {
                let lastToken : Token = <Token>result[result.length - 1];
                if (
                    lastToken != null &&
                    lastToken.type === TokenType.TEXT &&
                    mockState.output &&
                    (<Token>mockState.output).type === TokenType.TEXT
                ) {
                    lastToken.value += (<Token>mockState.output).value;

                } else {
                    result.push(<Token>mockState.output);
                }

                tokens = mockState.tokens;
                cursor = mockState.cursor;
                continue;
            }

            // Assume anything else is plain text
            const last : Token = <Token>result[result.length - 1];
            if (last != null && last.type === TokenType.TEXT) {
                last.value += tokens[cursor].value;

            } else {
                result.push(new TextToken(tokens[cursor]));
            }

            cursor += 1;
        }

        return new Expression({
            options: {
                ...(this.config),
                functionHandlers: { ...(this.functionHandlers) },
                functionLookups: { ...(this.functionLookups)}
            },
            value: result
        });
    }

    static async tokenize(subject: string, options?: ParserOptions) : Promise<Expression> {
        const parser = new Expressionish(options);
        return parser.tokenize(subject);
    }

    static async evaluate(subject: string, meta: any = {}, options?: ParserOptions) : Promise<string> {
        const tokens = await Expressionish.tokenize(subject, options);
        return tokens.evaluate(meta);
    }
}