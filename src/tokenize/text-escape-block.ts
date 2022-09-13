import ParserOptions from '../types/options';
import type { TokenizeState } from './tokenize';

import TextToken from '../tokens/text';
import TokenType from '../types/token-types';
import Token from '../tokens/base';

// import tokenizeFunctionIf from './function-if;
import tokenizeFunction from './function';

export default (
    options: ParserOptions,
    meta: any,
    state: TokenizeState,
) : boolean => {
    let { tokens, cursor, output } = state;

    if (tokens[cursor].value !== '``') {
        return false;
    }
    cursor += 1;

    if (cursor < (tokens.length - 1)) {
        // TODO - custom error
        throw new Error('TODO');
    }

    const escTokens : Token[] = [];
    while (cursor < tokens.length && tokens[cursor].value !== '``') {

        const mockState = {
            ...state,
            cursor,
            output: escTokens
        };

        if (
            /* TODO: Uncomment once tokenize* is implemented
            tokenizeFunctionIf(options, meta, mockState) ||
            */
            tokenizeFunction(options, meta, mockState)
        ) {
            cursor = mockState.cursor;
            continue;
        }

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
        throw new Error('TODO');
    }

    output.push(...escTokens);
    state.cursor = cursor + 1;

    return true;
}