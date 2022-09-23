import type IParseOptions from '../types/options';
import type ITokenizeState from '../types/tokenize-state';
import TokenType from '../types/token-types';
import getPotentialTokens from '../helpers/get-potential-tokens';

import type Token from './token';
import Expression from './expression';

import {
    TextToken,
    tokenizeEscape,
    tokenizeEscapeBlock,
    tokenizeQuoted,
    tokenizeSpecial
} from './text';

import { tokenizeIf } from './if'
import { tokenizeFunction } from './function';

export default async (options: IParseOptions, subject: string) : Promise<Expression> => {
    if (subject == null || typeof subject !== 'string') {
        throw new TypeError('input must be a string');
    }

    let tokens = getPotentialTokens(options, subject);
    let cursor = 0;

    const result : Token[] = [];

    while (cursor < tokens.length) {
        const mockState : ITokenizeState = {
            options: { ...options },
            stack: [],
            tokens: [ ...tokens ],
            cursor
        };

        if (
            await tokenizeEscape(mockState) ||
            await tokenizeEscapeBlock(mockState) ||
            await tokenizeQuoted(mockState) ||
            await tokenizeSpecial(mockState) ||
            await tokenizeIf(mockState) ||
            await tokenizeFunction(mockState)
        ) {
            const lastToken : Token = <Token>result[result.length - 1];
            if (
                lastToken != null &&
                lastToken.type === TokenType.TEXT &&
                mockState.output &&
                (<Token>mockState.output).type === TokenType.TEXT
            ) {
                (<string>lastToken.value) += (<Token>mockState.output).value;

            } else {
                result.push(<Token>mockState.output);
            }

            tokens = mockState.tokens;
            cursor = mockState.cursor;
            continue;
        }

        // Assume anything else is plain text
        const last : Token = <Token>result[result.length - 1];
        if (last != null && last.type === TokenType.TEXT) {
            last.value += tokens[cursor].value;

        } else {
            result.push(new TextToken(tokens[cursor]));
        }

        cursor += 1;
    }

    return new Expression({
        options: options,
        input: subject,
        tokens: result
    });
}