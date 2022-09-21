import type ITokenizeState from '../types/tokenize-state';

import type Token from '../tokens/token';
import NotToken from '../tokens/logical/logical-not';

import tokenizeConditionBlock from './condition-block';

export default async (state: ITokenizeState) : Promise<boolean> => {

    const { options, stack, tokens } = state;
    let { cursor } = state;

    const startPosition = cursor;

    if (
        cursor + 1 >= tokens.length ||
        tokens[cursor].value !== '!' ||
        tokens[cursor + 1].value !== '['
    ) {
        return false;
    }

    cursor += 1;

    const mockState : ITokenizeState = {
        options: { ...options },
        stack: [ ...stack ],
        tokens: [ ...tokens ],
        cursor
    };

    if (await tokenizeConditionBlock(mockState)) {
        state.tokens = mockState.tokens;
        state.cursor = mockState.cursor;
        state.output = new NotToken({
            position: startPosition,
            left: <Token>mockState.output
        });

        return true;
    }

    return false;
};