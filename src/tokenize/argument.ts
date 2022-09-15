import Token from '../tokens/base';
import TokenList from '../tokens/token-list';
import ParserOptions from '../types/options';
import { TokenizeState } from './tokenize';
import TokenType from '../types/token-types';

import tokenizeTextEscapeSingle from './text-escape-single';
import tokenizeTextEscapeBlock from './text-escape-block';
import tokenizeTextQuoted from './text-quoted';
import tokenizeTextSpecial from './text-special';
import tokenizeFunctionIf from './function-if';
import tokenizeFunction from './function';
import TextToken from '../tokens/text';

export default (
    options: ParserOptions,
    meta: any,
    state: TokenizeState
) : boolean => {

    let { tokens, cursor } = state;

    const position = tokens[cursor]?.value;


    let whitespaceStart = 0,
        whitespace = '';
    const result : Token[] = [];
    while (
        cursor < tokens.length &&
        tokens[cursor].value !== ',' &&
        tokens[cursor].value !== ']'
    ) {
        const lastToken : Token | void = result[result.length - 1];

        const mockState : TokenizeState = {
            tokens,
            cursor
        }

        if (
            tokenizeTextEscapeSingle(mockState, ['"', '$', '\\', ',', ']',]) ||
            tokenizeTextEscapeBlock(options, meta, mockState) ||
            tokenizeTextQuoted(options, meta, mockState) ||
            tokenizeTextSpecial(options, mockState) ||
            tokenizeFunctionIf(options, meta, mockState) ||
            tokenizeFunction(options, meta, mockState)
        ) {
            if (mockState.output) {
                let output : Token = <Token>mockState.output;

                if (lastToken == null) {
                    result.push(output);

                } else {

                    const lastTokenIsText = lastToken != null && lastToken.type === TokenType.TEXT;
                    const mockTokenIsText = output.type === TokenType.TEXT;

                    if (lastTokenIsText) {
                        lastToken.value += whitespace;
                        if (mockTokenIsText) {
                            lastToken.value += output.value;

                        } else {
                            result.push(output);
                        }

                    } else if (mockTokenIsText) {
                        output.value = `${whitespace}${output.value}`;
                        result.push(output);

                    } else{
                        if (whitespace !== '') {

                            result.push(new TextToken({
                                position: whitespaceStart,
                                value: whitespace
                            }));

                            result.push(output);
                        }
                    }
                }
            }
            whitespaceStart = 0;
            whitespace = '';

            tokens = mockState.tokens;
            cursor = mockState.cursor;

            continue;
        }

        let value = tokens[cursor].value;
        if (value === ' ' || value === '\t' || value === '\n' || value === '\r' ) {
            if (whitespaceStart === 0) {
                whitespaceStart = cursor;
            }
            whitespace += value;

            cursor += 1;

        } else if (value !== ',' && value !== ']') {
            if (!lastToken) {
                result.push(new TextToken({
                    position: cursor,
                    value
                }));

            } else if (lastToken.type === TokenType.TEXT) {
                lastToken.value += whitespace + value;

            } else {
                result.push(new TextToken({
                    position: cursor,
                    value: whitespace + value
                }));
            }

            whitespaceStart = 0;
            whitespace = '';

            cursor += 1;
        }
    }

    if (cursor >= tokens.length) {
        // TODO - custom error - Syntax Error: Unexpected End
        throw new Error('TODO - SyntaxError: Unexpected end');
    }

    const next = tokens[cursor + 1].value;
    if (next !== ',' && next !== ']') {
        // TODO - custom error - Syntax Error: Illegal character
        throw new Error('TODO - SyntaxError: Illegal character');
    }


    state.tokens = tokens;
    state.cursor = cursor;
    state.output = new TokenList({
        position,
        value: result
    })

    return false;
}