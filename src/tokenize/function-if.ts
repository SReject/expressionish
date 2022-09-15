import ParserOptions from '../types/options';
import TokenType from '../types/token-types';
import type IPreToken from '../types/pre-token';

import Token from '../tokens/token';
import IfToken from '../tokens/token-function-if';
import type OperatorToken from '../tokens/token-operator';

import { type TokenizeState } from './tokenize';
import tokenizeCondition from './condition';
import tokenizeArgument from './argument';

const consumeWhitespace = (tokens: IPreToken[], cursor: number) : number => {
    while (cursor < tokens.length && /^\s$/.test(tokens[cursor].value)) {
        cursor += 1;
    }
    return cursor;
};

const getNextArg = (options: ParserOptions, meta: any, state: TokenizeState) : TokenizeState => {
    let { tokens, cursor } = state;

    cursor = consumeWhitespace(tokens, cursor);
    if (cursor >= tokens.length) {
        // TODO - custom error - SyntaxError: Unexpected end
        throw new Error('TODO - SyntaxError: unexpected end');
    }

    // no argument
    if (tokens[cursor].value === ']') {
        return { tokens, cursor };
    }

    // no leading delimiter
    if (tokens[cursor].value !== ',') {
        // TODO - custom error - SyntaxError: Illegal character
        throw new Error('TODO - SyntaxError: Illegal character');
    }
    cursor += 1;

    if (cursor >= tokens.length) {
        // TODO - custom error - SyntaxError: Unexpected end
        throw new Error('TODO - SyntaxError: unexpected end');
    }

    const position = tokens[cursor].position;

    cursor = consumeWhitespace(tokens, cursor);

    // empty argument
    if (
        tokens[cursor].value === ',' ||
        tokens[cursor].value === ']'
    ) {
        return {
            tokens,
            cursor: cursor + 1,
            output: new Token({
                position,
                type: TokenType.EMPTY
            })
        };
    }

    const mockState : TokenizeState = {
        tokens,
        cursor
    };
    tokenizeArgument(options, meta, mockState);
    return mockState;
};

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

    cursor = consumeWhitespace(tokens, cursor + 3);

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

    // No return values - $if[<condition>]
    if (tokens[cursor].value === ']') {
        state.tokens = tokens;
        state.cursor = cursor + 1;
        state.output = new Token({
            position: position,
            type: TokenType.EMPTY
        });
        return true;
    }

    if (tokens[cursor]?.value !== ',') {
        // TODO - custom error - SyntaxError: Illegal character
        throw new Error('TODO - SyntaxError: Illegal character');
    }

    const stateWhenTrue = getNextArg(options, meta, { tokens, cursor });
    const stateWhenFalse = getNextArg(options, meta, { ...stateWhenTrue });

    tokens = stateWhenFalse.tokens;
    cursor = stateWhenFalse.cursor;

    if (tokens[cursor].value !== ']') {
        // TODO - custom error - SyntaxError: Illegal character
        throw new Error('TODO - SyntaxError: Illegal character');
    }

    state.tokens = tokens;
    state.cursor = cursor + 1;
    if (stateWhenFalse.output != null && (<Token>stateWhenFalse.output).type !== TokenType.EMPTY) {
        state.output = new IfToken({
            position,
            condition,
            whenTrue: <Token>stateWhenTrue.output,
            whenFalse: <Token>stateWhenFalse.output
        });
    } else if (stateWhenTrue.output != null && (<Token>stateWhenTrue.output).type !== TokenType.EMPTY) {
        state.output = new IfToken({
            position,
            condition,
            whenTrue: <Token>stateWhenTrue.output
        });
    } else {
        state.output = new Token({
            position: position,
            type: TokenType.EMPTY
        });
    }

    return true;
}