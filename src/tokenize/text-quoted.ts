import ParserOptions from '../types/options';
import type { TokenizeState } from './tokenize';
import TextToken from '../tokens/text';
import TokenType from '../types/token-types';
import Token from '../tokens/base';
import tokenizeEscapeSingle from './text-escape-single';
import tokenizeTextSpecial from './text-special';
import tokenizeFunctionIf from './function-if';
import tokenizeFunction from './function';
import TokenList from '../tokens/token-list';

export default (
    options: ParserOptions,
    meta: any,
    state: TokenizeState
) : boolean => {
    let { tokens, cursor } = state;

    if (tokens[cursor]?.value !== '"') {
        return false;
    }

    const position = tokens[cursor]?.position;

    cursor += 1;

    if (cursor === tokens.length) {
        // TODO - custom error - unexpected end
        throw new Error('TODO - Syntax Error: unexpected end');
    }

    const quoteTokens : Token[] = [];
    while (
        cursor < tokens.length &&
        tokens[cursor].value !== '"'
    ) {

        let lastToken : Token = quoteTokens[quoteTokens.length - 1];

        const mockState : TokenizeState = {
            tokens,
            cursor
        };
        if (
            tokenizeEscapeSingle(mockState, ['\\', '"']) ||
            tokenizeTextSpecial(options, mockState)  ||
            tokenizeFunctionIf(options, meta, mockState) ||
            tokenizeFunction(options, meta, mockState)
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
        // TODO - custom error - unexpected end
        throw new Error('TODO - SyntaxError: unexpected end');
    }

    if (tokens[cursor].value !== '"') {
        // TODO - custom error - expected closing token
        throw new Error('TODO - Syntax Error: expected closing quote');
    }

    state.tokens = tokens;
    state.cursor = cursor + 2;
    state.output = new TokenList({
        position,
        value: quoteTokens
    });

    return true;
}