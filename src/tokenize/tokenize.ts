import type ParserOptions from '../types/options';
import TokenType from '../types/token-types';
import type IPreToken from '../types/pre-token';

import getPotentialTokens from '../helpers/get-potential-tokens';

import Token from '../tokens/token';
import TokenList, { ITokenList } from '../tokens/token-list';
import TextToken from '../tokens/token-text';

import tokenizeTextEscapeSingle from './text-escape-single';
import tokenizeTextEscapeBlock from './text-escape-block';
import tokenizeTextQuoted from './text-quoted';
import tokenizeTextSpecial from './text-special';
import tokenizeFunctionIf from './function-if';
import tokenizeFunction from './function';

export interface TokenizeState {
    tokens: IPreToken[];
    cursor: number;
    output?: Token | Token[];
}

export default (subject: string, options: ParserOptions, meta: any = {}) : TokenList => {

    let tokens = getPotentialTokens(options, subject);

    const result : Array<void | Token> = [];

    let cursor = 0;

    // trim leading and trailing spaces
    while (tokens.length && tokens[0].value === ' ') tokens.shift();
    while (tokens.length && tokens[tokens.length - 1].value === ' ') tokens.pop();

    while (cursor < tokens.length) {

        let mockState : TokenizeState = {
            tokens: tokens,
            cursor: cursor
        };

        if (
            tokenizeTextEscapeSingle(mockState) ||
            tokenizeTextEscapeBlock(options, meta, mockState) ||
            tokenizeTextQuoted(options, meta, mockState) ||
            tokenizeTextSpecial(options, mockState) ||
            tokenizeFunctionIf(options, meta, mockState) ||
            tokenizeFunction(options, meta, mockState)
        ) {
            let lastToken : Token = <Token>result[result.length - 1];
            if (
                lastToken != null &&
                lastToken.type === TokenType.TEXT &&
                mockState.output &&
                (<Token>mockState.output).type === TokenType.TEXT
            ) {
                lastToken.value += (<Token>mockState.output).value;

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

    return new TokenList(<ITokenList>{
        value: result
    });
}