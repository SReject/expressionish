import { consume as consumeWS } from '../helpers/whitespace';

import type Token from '../tokens/token';
import type ITokenizeState from '../types/tokenize-state';

import tokenizeCondition from './condition';

export default async (state: ITokenizeState) : Promise<boolean> => {
    const { options, stack, tokens } = state;
    let { cursor } = state;

    cursor = consumeWS(tokens, cursor);

    if (cursor + 1 >= tokens.length || tokens[cursor].value !== '[') {
        return false;
    }
    cursor += 1;

    const mockState : ITokenizeState = {
        options: { ...options },
        stack: [ ...stack ],
        tokens: [ ...tokens ],
        cursor
    };

    if (!await tokenizeCondition(mockState)) {
        throw new Error('TODO - SyntaxError: conditional expected');
    }

    cursor = consumeWS(tokens, mockState.cursor);
    if (
        cursor >= tokens.length
    ) {
        throw new Error('TODO - SyntaxError: Unexpected end');
    }

    if (tokens[cursor].value !== ']') {
        throw new Error('TODO - SyntaxError: expected \']\'');
    }

    state.tokens = mockState.tokens;
    state.cursor = cursor + 1;
    state.output = <Token>mockState.output;
    return true;
}