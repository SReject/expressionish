import ParserOptions from '../types/options';
import getPotentialTokens from '../helpers/get-potential-tokens';
import { default as Token, IToken } from '../tokens/base';
import TokenList, { ITokenList } from '../tokens/token-list';

import tokenizeTextEscapeSingle from './text-escape-single';
import tokenizeTextEscapeBlock from './text-escape-block';
import tokenizeTextQuoted from './text-quoted';
import tokenizeTextSpecial from './text-special';
import TokenType from '../types/token-types';
import TextToken from '../tokens/text';

export interface TokenizeState {
    tokens: IToken[];
    cursor: number;
    output: Token[];
}

export default (subject: string, options: ParserOptions, meta: any = {}) : TokenList => {
    const tokens = getPotentialTokens(subject);

    const state : TokenizeState = {
        tokens,
        cursor: 0,
        output: []
    }

    while (state.cursor < tokens.length) {
        if (
            tokenizeTextEscapeSingle(state) ||
            tokenizeTextEscapeBlock(options, meta, state) ||
            tokenizeTextQuoted(options, meta, state) ||
            tokenizeTextSpecial(options, state) /* ||
            tokenizeFunctionIf(options, meta, state) ||
            tokenizeFunction(options, meta, state)
            */
        ) {
            continue;
        }

        const { tokens, output, cursor } = state;

        if (output.length === 0 || output[output.length - 1].type !== TokenType.TEXT) {
            output.push(new TextToken(tokens[cursor]));

        } else {
            output[output.length - 1].value += tokens[cursor].value;
        }

        state.cursor += 1;
    }

    if (state.cursor < tokens.length) {
        // TODO - custom error;
        throw new Error('TODO');
    }

    return new TokenList(<ITokenList>{
        value: state.output
    });
}