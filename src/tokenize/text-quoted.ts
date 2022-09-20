import TokenType from '../types/token-types';

import type Token from '../tokens/token';
import TokenList from '../tokens/token-list';
import TextToken from '../tokens/token-text';

import tokenizeEscapeSingle from './text-escape-single';
import tokenizeTextSpecial from './text-special';
import tokenizeFunctionIf from './function-if';
import tokenizeFunction from './function';

import type ITokenizeState from '../types/tokenize-state';

import { ExpressionSyntaxError } from '../errors';

export default async (state: ITokenizeState) : Promise<boolean> => {

    let { tokens, cursor } = state;
    const stack = state.stack;

    if (tokens[cursor]?.value !== '"') {
        return false;
    }

    const position = tokens[cursor]?.position;

    cursor += 1;

    if (cursor === tokens.length) {
        throw new ExpressionSyntaxError('unexpected end of expression');
    }

    const quoteTokens : Token[] = [];
    while (
        cursor < tokens.length &&
        tokens[cursor].value !== '"'
    ) {

        const lastToken : Token = quoteTokens[quoteTokens.length - 1];

        const mockState : ITokenizeState = {
            options: {...(state.options)},
            tokens,
            cursor,
            stack: [...stack, 'text-quoted']
        };
        if (
            await tokenizeEscapeSingle(mockState, ['\\', '"']) ||
            await tokenizeTextSpecial(mockState)  ||
            await tokenizeFunctionIf(mockState) ||
            await tokenizeFunction(mockState)
        ) {

            if (mockState.output != null) {
                if (
                    lastToken &&
                    lastToken.type === TokenType.TEXT &&
                    (<Token>mockState.output).type === TokenType.TEXT
                ) {
                    lastToken.value += <string>(<Token>mockState.output).value;
                } else {
                    quoteTokens.push(<Token>mockState.output);
                }
            }
            tokens = mockState.tokens;
            cursor = mockState.cursor;
            continue;
        }

        // Treat everything else as text
        if (lastToken && lastToken.type === TokenType.TEXT) {
            lastToken.value += tokens[cursor].value;

        } else {
            quoteTokens.push(new TextToken({
                position: cursor,
                value: tokens[cursor].value
            }));
        }
        cursor += 1;
    }

    if (cursor >= tokens.length) {
        throw new ExpressionSyntaxError('unexpected end of expression');
    }

    if (tokens[cursor].value !== '"') {
        throw new ExpressionSyntaxError('expected closing quote', tokens[cursor].position);
    }

    state.tokens = tokens;
    state.cursor = cursor + 2;
    state.output = new TokenList({
        position,
        value: quoteTokens
    });

    return true;
}