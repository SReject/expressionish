import { consume as consumeWS } from '../helpers/whitespace';

import type ITokenizeState from '../types/tokenize-state';

import type Token from '../tokens/token';
import type LogicalToken from '../tokens/logical/base';
import AndLogicalToken from '../tokens/logical/logical-and';
import OrLogicalToken from '../tokens/logical/logical-or';

import tokenizeConditionalNot from './condition-not';
import tokenizeConditionBlock from './condition-block';
import tokenizeComparison from './comparison/index';

interface Type<T = unknown> extends Function {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
}

export default async (state: ITokenizeState, leftCondition: Token, asArgument = false) : Promise<boolean> => {

    const { options, stack } = state;
    let { tokens, cursor } = state;

    cursor = consumeWS(tokens, cursor);

    const startPosition = tokens[cursor].position;

    if (
        tokens[cursor].value !== '&&' &&
        tokens[cursor].value !== '||'
    ) {
        return false;
    }
    const TokenClass : Type<LogicalToken> = (tokens[cursor].value === '||' ? OrLogicalToken : AndLogicalToken);

    cursor = consumeWS(tokens, cursor + 1);

    const mockState : ITokenizeState = {
        options: { ...options },
        stack: [ ...stack ],
        tokens: [ ...tokens ],
        cursor
    };

    let rightCondition: Token;
    if (
        await tokenizeConditionalNot(mockState) ||
        await tokenizeConditionBlock(mockState) ||
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
    state.output = new TokenClass({
        position: startPosition,
        left: leftCondition,
        right: rightCondition
    });
    return true;
}