import TokenType from '../types/token-types';

import Token from '../tokens/token';
import IfToken from '../tokens/token-function-if';
import type OperatorToken from '../tokens/token-operator';

import type ITokenizeState from '../types/tokenize-state';
import tokenizeArgumentList from './argument-list';

import { ExpressionSyntaxError } from '../errors';

export default async (state: ITokenizeState) : Promise<boolean> => {
    const { tokens, stack, options } = state;
    let cursor = state.cursor;

    if (
        tokens[cursor]?.value !== '$' ||
        tokens[cursor + 1]?.value !== 'if' ||
        tokens[cursor + 2]?.value !== '['
    ) {
        return false;
    }

    const position = tokens[cursor].position;
    cursor += 2;

    const mockState : ITokenizeState = {
        options: { ...options },
        tokens,
        cursor,
        stack: [...stack, '$if']
    }
    await tokenizeArgumentList(mockState, true);

    const args = <Token[]>mockState.output;

    if (args.length > 3) {
        throw new ExpressionSyntaxError('Expected end of arguments', args[3].position);
    }

    if (args.length === 3 && args[2].type === TokenType.EMPTY) {
        args.pop();
    }
    if (args.length === 2 && args[1].type === TokenType.EMPTY) {
        args.pop();
    }

    state.tokens = mockState.tokens;
    state.cursor = mockState.cursor;

    // $if[] or $if[<condition>] or $if[<condition>,] or $if[<condition>,,]
    if (args.length < 2) {
        state.output = new Token({
            position: position,
            type: TokenType.EMPTY
        });

    // $if[<condition>, <arg>] or $if[<condition>, <arg>,] or $if[<condition>, <arg>, <arg>]
    } else {
        state.output = new IfToken({
            position,
            condition: <OperatorToken>args[0],
            whenTrue: args[1],
            whenFalse: args[2]
        });
    }

    return true;
}