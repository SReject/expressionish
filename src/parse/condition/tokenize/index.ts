import type ITokenizeState from '../../../types/tokenize-state';

import type Token from '../../token';

import tokenizeLogicalNot from './logical-not';
import tokenizeBlock from './block';
import tokenizeComparison from './comparison';
import tokenizeLogicalOperator from './logical-operator';

export default async (state: ITokenizeState, asArgument = false) : Promise<boolean> => {

    const { options, stack, tokens, cursor } = state;

    let mockState: ITokenizeState = {
        options: { ...options },
        stack: [ ...stack ],
        tokens: [ ...tokens ],
        cursor
    };

    if (
        await tokenizeLogicalNot(mockState) ||
        await tokenizeBlock(mockState) ||
        await tokenizeComparison(mockState, asArgument)
    ) {
        let condition = <Token>mockState.output;

        mockState = {
            options: { ...options },
            stack: [ ...stack ],
            tokens: [ ...(mockState.tokens) ],
            cursor: mockState.cursor
        };
        while (await tokenizeLogicalOperator(mockState, condition, asArgument)) {
            condition = <Token>mockState.output;
            mockState = {
                options: { ...options },
                stack: [ ...stack ],
                tokens: [ ...(mockState.tokens) ],
                cursor: mockState.cursor
            };
        }

        state.tokens = mockState.tokens;
        state.cursor = mockState.cursor;
        state.output = condition;

        return true;
    }

    return false
}