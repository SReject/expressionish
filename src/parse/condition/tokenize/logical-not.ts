import type ITokenizeState from '../../../types/tokenize-state';

import type Token from '../../token';

import { OperatorToken, notOperator } from '../operators';

import tokenizeBlock from './block';

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

    if (await tokenizeBlock(mockState)) {
        state.tokens = mockState.tokens;
        state.cursor = mockState.cursor;
        state.output = new OperatorToken({
            position: startPosition,
            value: notOperator.name,
            quantifier: notOperator.quantifier,
            arguments: [<Token>mockState.output],
            handle: notOperator.handle
        });
        return true;
    }

    return false;
};