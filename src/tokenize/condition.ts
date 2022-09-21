import type ITokenizeState from '../types/tokenize-state';

import type Token from '../tokens/token';

import tokenizeComparison from './comparison';
import tokenizeConditionBlock from './condition-block';
import tokenizeConditionNot from './condition-not';
import tokenizeLogicalOperator from './condition-logical';

export default async (state: ITokenizeState, asArgument = false) : Promise<boolean> => {

    const { options, stack, tokens, cursor } = state;

    let mockState: ITokenizeState = {
        options: { ...options },
        stack: [ ...stack ],
        tokens: [ ...tokens ],
        cursor
    };

    if (
        await tokenizeConditionNot(mockState) ||
        await tokenizeConditionBlock(mockState) ||
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