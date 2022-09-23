import { consume as consumeWS } from '../../../helpers/whitespace';

import type ITokenizeState from '../../../types/tokenize-state';

import type Token from '../../token';
import { OperatorToken, logicalOperators, type IOperator } from '../operators';

import tokenizeLogicalNot from './logical-not';
import tokenizeBlock from './block';
import tokenizeComparison from './comparison';

export default async (state: ITokenizeState, leftCondition: Token, asArgument = false) : Promise<boolean> => {

    const { options, stack } = state;
    let { tokens, cursor } = state;

    cursor = consumeWS(tokens, cursor);

    const startPosition = tokens[cursor].position;

    if (!logicalOperators.has(tokens[cursor].value)) {
        return false;
    }
    const operator = <IOperator>logicalOperators.get(tokens[cursor].value);

    cursor = consumeWS(tokens, cursor + 1);

    const mockState : ITokenizeState = {
        options: { ...options },
        stack: [ ...stack ],
        tokens: [ ...tokens ],
        cursor
    };

    let rightCondition: Token;
    if (
        await tokenizeLogicalNot(mockState) ||
        await tokenizeBlock(mockState) ||
        await tokenizeComparison(mockState, asArgument)
    ) {
        tokens = mockState.tokens;
        cursor = mockState.cursor;
        rightCondition = <Token>mockState.output;

    } else {
        throw new Error('TODO - SyntaxError: invalid right handle conditional');
    }

    state.tokens = tokens;
    state.cursor = cursor;
    state.output = new OperatorToken({
        position: startPosition,
        value: operator.name,
        arguments: [leftCondition, rightCondition],
        argumentsQuantifier: operator.arguments,
        handle: operator.handle
    });
    return true;
}