import ParserOptions from '../types/options';
import TokenType from '../types/token-types';

import Token from '../tokens/token';
import IfToken from '../tokens/token-function-if';
import type OperatorToken from '../tokens/token-operator';

import { type TokenizeState } from './tokenize';
import tokenizeCondition from './condition';

export default (
    options: ParserOptions,
    meta: any,
    state: TokenizeState
) : boolean => {

    let { tokens, cursor } = state;

    if (
        tokens[cursor]?.value !== '$' ||
        tokens[cursor + 1]?.value !== 'if' ||
        tokens[cursor + 2]?.value !== '['
    ) {
        return false;
    }

    const position = tokens[cursor]?.position;

    cursor += 3;

    while (/^\s$/g.test(tokens[cursor]?.value)) {
        cursor += 1;
    }

    if (cursor >= tokens.length) {
        // TODO - custom error - SyntaxError: Unexpected end
        throw new Error('TODO - SyntaxError: unexpected end');
    }

    // empty $if[]
    if (tokens[cursor].value === ']') {
        cursor += 1;
        state.cursor = cursor;
        state.output = new Token({
            position,
            type: TokenType.EMPTY
        });
        return true;
    }

    let mockState : TokenizeState = {
        tokens,
        cursor
    };
    if (!tokenizeCondition(options, meta, state)) {
        // TODO - custom error - SyntaxError: Invalid Condition
        throw new Error('TODO - SyntaxError: Invalid Condition');
    }
    tokens = mockState.tokens;
    cursor = mockState.cursor;
    const condition : OperatorToken = <OperatorToken>mockState.output;

    if (tokens[cursor] == null) {
        // TODO - custom error - SyntaxError: unexpected end
        throw new Error('TODO - SyntaxError: unexpected end');
    }

    // empty conditional
    if (tokens[cursor].value === ']') {
        state.tokens = tokens;
        state.cursor = cursor;
        state.output = new Token({
            position: position,
            type: TokenType.EMPTY
        });
        return true;
    }



    return false;
    /*
    state.tokens = tokens;
    state.cursor = cursor;
    state.output = new IfStatementToken({
        position,
        condition,
        whenTrue,
        whenFalse
    });
    return true;
    */
}