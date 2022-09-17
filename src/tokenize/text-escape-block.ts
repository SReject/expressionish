import TokenType from '../types/token-types';

import type Token from '../tokens/token';
import TokenList from '../tokens/token-list';
import TextToken from '../tokens/token-text';

import tokenizeFunctionIf from './function-if';
import tokenizeFunction from './function';

import type ITokenizeState from '../types/tokenize-state';
import { ExpressionSyntaxError } from '../errors';

export default async (state: ITokenizeState) : Promise<boolean> => {
    let { tokens, cursor } = state;
    const stack = state.stack;

    if (tokens[cursor]?.value !== '``') {
        return false;
    }

    const position = tokens[cursor].position;

    cursor += 1;

    if (cursor < (tokens.length - 1)) {
        throw new ExpressionSyntaxError('unexpected end of expression');
    }

    const escTokens : Token[] = [];
    while (cursor < tokens.length && tokens[cursor].value !== '``') {

        const mockState : ITokenizeState = {
            options: { ...(state.options) },
            tokens,
            cursor,
            stack: [ ...stack, 'text-escape-block' ]
        };

        if (
            await tokenizeFunctionIf(mockState) ||
            await tokenizeFunction(mockState)
        ) {
            if (mockState.output) {
                escTokens.push(<Token>mockState.output);
            }
            tokens = mockState.tokens;
            cursor = mockState.cursor;
            continue;
        }

        // Treat everything else as plain text
        if (
            escTokens.length === 0 ||
            escTokens[escTokens.length - 1].type != TokenType.TEXT
        ) {
            escTokens.push(new TextToken(tokens[cursor]));

        } else {
            escTokens[escTokens.length - 1].value += tokens[cursor].value;
        }

        cursor += 1;
    }

    if (tokens[cursor].value !== '``') {
        throw new ExpressionSyntaxError('unexpected end of expression');
    }

    state.tokens = tokens;
    state.cursor = cursor + 1;
    state.output = new TokenList({
        position,
        value: escTokens
    });

    return true;
}