import type ParserOptions from '../types/options';
import TokenType from '../types/token-types';

import type Token from '../tokens/token';
import TokenList from '../tokens/token-list';
import TextToken from '../tokens/token-text';

import type { TokenizeState } from './tokenize';
import tokenizeTextEscapeSingle from './text-escape-single';
import tokenizeTextEscapeBlock from './text-escape-block';
import tokenizeTextQuoted from './text-quoted';
import tokenizeTextSpecial from './text-special';
import tokenizeFunctionIf from './function-if';
import tokenizeFunction from './function';

import { ExpressionSyntaxError } from '../errors';

export default async (options: ParserOptions, meta: any, state: TokenizeState) : Promise<boolean> => {

    let { tokens, cursor, stack } = state;

    const position = tokens[cursor]?.position;

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
            cursor,
            stack: [...stack]
        };

        if (
            await tokenizeTextEscapeSingle(mockState, ['"', '$', '\\', ',', ']',]) ||
            await tokenizeTextEscapeBlock(options, meta, mockState) ||
            await tokenizeTextQuoted(options, meta, mockState) ||
            await tokenizeTextSpecial(options, mockState) ||
            await tokenizeFunctionIf(options, meta, mockState) ||
            await tokenizeFunction(options, meta, mockState)
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
        throw new ExpressionSyntaxError('unexpected end of expression');
    }

    const next = tokens[cursor + 1];
    if (next.value !== ',' && next.value !== ']') {
        throw new ExpressionSyntaxError('illegal character', next.position, next.value[0]);
    }

    state.tokens = tokens;
    state.cursor = cursor;
    state.output = new TokenList({
        position,
        value: result
    })

    return false;
}