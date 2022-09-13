import ParserOptions from '../types/options';
import type { TokenizeState } from './tokenize';

import TextToken from '../tokens/text';
import TokenType from '../types/token-types';
import Token from '../tokens/base';

export default (
    options: ParserOptions,
    meta: any,
    state: TokenizeState,
) : boolean => {
    let { tokens, cursor, output } = state;

    if (
        cursor < (tokens.length - 2) ||
        `${tokens[cursor].value}${tokens[cursor + 1].value}` !== '``'
    ) {
        return false;
    }
    cursor += 2;

    const escTokens : Token[] = [];
    while (
        cursor < (tokens.length - 2) &&
        `${tokens[cursor].value}${tokens[cursor + 1].value}` !== '``'
    ) {

        /* TODO: Uncomment once tokenize* is implemented
        const mockState = {
            ...state,
            cursor,
            output: escTokens
        };
        if (
            tokenizeFunctionIf(options, meta, mockState) ||
            tokenizeFunction(options, meta, mockState)
        ) {
            cursor = mockState.cursor;
            continue;
        }
        */

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

    if (
        cursor > (tokens.length - 2) ||
        `${tokens[cursor].value}${tokens[cursor + 1].value}` !== '``'
    ) {
        // TODO - custom error
        throw new Error('TODO');
    }

    output.push(...escTokens);
    state.cursor = cursor + 2;

    return true;
}