import type ParserOptions from '../types/options';
import TokenType from '../types/token-types';

import type Token from '../tokens/token';
import TokenList from '../tokens/token-list';
import TextToken from '../tokens/token-text';

import tokenizeEscapeSingle from './text-escape-single';
import tokenizeTextSpecial from './text-special';
import tokenizeFunctionIf from './function-if';
import tokenizeFunction from './function';

import type { TokenizeState } from './tokenize';
import { ExpressionSyntaxError } from '../errors';

export default async (
    options: ParserOptions,
    meta: any,
    state: TokenizeState
) : Promise<boolean> => {
    let { tokens, cursor, stack } = state;

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

        let lastToken : Token = quoteTokens[quoteTokens.length - 1];

        const mockState : TokenizeState = {
            tokens,
            cursor,
            stack: [...stack, 'text-quoted']
        };
        if (
            await tokenizeEscapeSingle(mockState, ['\\', '"']) ||
            await tokenizeTextSpecial(options, mockState)  ||
            await tokenizeFunctionIf(options, meta, mockState) ||
            await tokenizeFunction(options, meta, mockState)
        ) {

            if (mockState.output != null) {
                if (
                    lastToken &&
                    lastToken.type === TokenType.TEXT &&
                    (<Token>mockState.output).type === TokenType.TEXT
                ) {
                    lastToken.value += (<Token>mockState.output).value;
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