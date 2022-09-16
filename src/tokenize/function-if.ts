import ParserOptions from '../types/options';
import TokenType from '../types/token-types';

import Token from '../tokens/token';
import IfToken from '../tokens/token-function-if';
import type OperatorToken from '../tokens/token-operator';

import { type TokenizeState } from './tokenize';
import tokenizeArgumentList from './argument-list';

export default async (options: ParserOptions, meta: any, state: TokenizeState) : Promise<boolean> => {

    let { tokens, cursor } = state;

    if (
        tokens[cursor]?.value !== '$' ||
        tokens[cursor + 1]?.value !== 'if' ||
        tokens[cursor + 2]?.value !== '['
    ) {
        return false;
    }

    const position = tokens[cursor]?.position;

    const mockState : TokenizeState = {
        tokens,
        cursor,
        meta: { isConditional: true }
    }
    await tokenizeArgumentList(options, meta, mockState);

    const args = <Token[]>mockState.output;

    if (args.length > 3) {
        // TODO - custom error - SyntaxError: expected end of arguments
        throw new Error('TODO - SyntaxError: Expected end of arguments')
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