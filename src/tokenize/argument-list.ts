import ParserOptions from '../types/options';
import { TokenizeState } from "./tokenize";
import Token from '../tokens/base';
import tokenizeArgument from './argument';
import TokenType from '../types/token-types';

export default (options: ParserOptions, meta: any, state: TokenizeState) : boolean => {

    let { tokens, cursor } = state;

    if (tokens[cursor]?.value !== '[') {
        return false;
    }
    cursor += 1;

    let args : Token[] = [];

    while (
        cursor < tokens.length &&
        tokens[cursor].value != ']'
    ) {

        while (tokens[cursor].value === ' ') {
            cursor += 1;
        }

        if (tokens[cursor].value === ']') {
            break;
        }

        if (tokens[cursor].value === ',') {
            args.push(new Token({
                position: cursor,
                type: TokenType.EMPTY,
                value: undefined
            }));
            cursor += 1;
            continue;
        }

        const mockState : TokenizeState = {
            tokens,
            cursor
        };

        if (tokenizeArgument(options, meta, mockState)) {

            if (mockState.output) {
                args.push(<Token>mockState.output);

            } else {
                args.push(new Token({
                    position: cursor,
                    type: TokenType.EMPTY,
                    value: undefined
                }));
            }
            tokens = mockState.tokens;
            cursor = mockState.cursor;

        } else {
            // TODO - custom error - SyntaxError: Illegal character
            throw new Error('TODO - SyntaxError: Illegal character');
        }
    }

    if (cursor >= tokens.length) {
        // TODO - custom error - SyntaxError: Unexpected end
        throw new Error('TODO - SyntaxError: Unexpected end');
    }

    if (tokens[cursor].value !== ']') {
        // TODO - custom error - SyntaxError: Expected ']'
        throw new Error('TODO - Syntax Error: Expected \']\'');
    }

    state.tokens = tokens;
    state.cursor = cursor + 1;
    state.output = args;

    return true;
};