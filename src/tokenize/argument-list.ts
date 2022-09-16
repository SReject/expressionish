import type ParserOptions from '../types/options';
import TokenType from '../types/token-types';

import Token from '../tokens/token';

import type { TokenizeState } from "./tokenize";
import tokenizeArgument from './argument';
import tokenizeCondition from './condition';

export default async (options: ParserOptions, meta: any, state: TokenizeState) : Promise<boolean> => {

    let { tokens, cursor, meta: stateMeta } = state;

    let isCondition = stateMeta.isConditional || false;

    if (tokens[cursor]?.value !== '[') {
        return false;
    }
    cursor += 1;

    let args : Token[] = [];

    while (
        cursor < tokens.length &&
        tokens[cursor].value != ']'
    ) {

        while (/^\s$/.test(tokens[cursor].value)) {
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

        if (
            (isCondition && await tokenizeCondition(options, meta, mockState)) ||
            (!isCondition && await tokenizeArgument(options, meta, mockState))
        ) {
            if (mockState.output) {
                args.push(<Token>mockState.output);

            } else {
                args.push(new Token({
                    position: cursor,
                    type: TokenType.EMPTY
                }));
            }
            tokens = mockState.tokens;
            cursor = mockState.cursor;

        } else {
            // TODO - custom error - SyntaxError: Illegal character
            throw new Error('TODO - SyntaxError: Illegal character');
        }

        isCondition = false;
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