import type ParserOptions from '../types/options';
import TokenType from '../types/token-types';

import type Token from '../tokens/token';
import TokenList from '../tokens/token-list';
import TextToken from '../tokens/token-text';

import tokenizeFunctionIf from './function-if';
import tokenizeFunction from './function';

import type { TokenizeState } from './tokenize';

export default (
    options: ParserOptions,
    meta: any,
    state: TokenizeState,
) : boolean => {
    let { tokens, cursor } = state;

    if (tokens[cursor]?.value !== '``') {
        return false;
    }

    const position = tokens[cursor].position;

    cursor += 1;

    if (cursor < (tokens.length - 1)) {
        // TODO - custom error
        throw new Error('TODO - Syntax Error: Unexpected end of statement');
    }

    const escTokens : Token[] = [];
    while (cursor < tokens.length && tokens[cursor].value !== '``') {

        const mockState : TokenizeState = {
            tokens,
            cursor
        };

        if (
            tokenizeFunctionIf(options, meta, mockState) ||
            tokenizeFunction(options, meta, mockState)
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
        // TODO - custom error
        throw new Error('TODO - Syntax Error: Unexpected end');
    }

    state.tokens = tokens;
    state.cursor = cursor + 1;
    state.output = new TokenList({
        position,
        value: escTokens
    });

    return true;
}