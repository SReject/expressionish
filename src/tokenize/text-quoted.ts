import ParserOptions from '../types/options';
import type { TokenizeState } from './tokenize';
import TextToken from '../tokens/text';
import TokenType from '../types/token-types';
import Token from '../tokens/base';
import tokenizeEscapeSingle from './text-escape-single';
import tokenizeTextSpecial from './text-special';
// import tokenizeFunctionIf from './function-if;
import tokenizeFunction from './function';

export default (
    options: ParserOptions,
    meta: any,
    state: TokenizeState
) : boolean => {
    let { tokens, cursor, output } = state;

    if (
        cursor < (tokens.length - 2) ||
        tokens[cursor].value !== '`' ||
        tokens[cursor + 1].value !== '`'
    ) {
        return false;
    }
    cursor += 2;

    const quoteTokens : Token[] = [];
    while (cursor < (tokens.length - 1) && tokens[cursor].value !== '"') {

        const mockState = {
            ...state,
            cursor,
            output: quoteTokens
        };
        if (
            tokenizeEscapeSingle(mockState, ['\\', '"']) ||
            tokenizeTextSpecial(options, mockState)  ||

            /* TODO - uncomment once implemented
            tokenizeFunctionIf(options, meta, mockState) ||
            */

            tokenizeFunction(options, meta, mockState)
        ) {
            cursor = mockState.cursor;
            continue;
        }

        if (
            quoteTokens.length === 0 ||
            quoteTokens[quoteTokens.length - 1].type != TokenType.TEXT
        ) {
            quoteTokens.push(new TextToken(tokens[cursor]));

        } else {
            quoteTokens[quoteTokens.length - 1].value += tokens[cursor].value;
        }

        cursor += 1;
    }

    if (
        cursor > (tokens.length - 1) ||
        tokens[cursor + 1].value !== '"'
    ) {
        // TODO - custom error
        throw new Error('TODO - Syntax Error: expected closing quote');
    }

    output.push(...quoteTokens);
    state.cursor = cursor + 2;

    return true;
}