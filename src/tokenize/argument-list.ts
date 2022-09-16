import type ParserOptions from '../types/options';
import TokenType from '../types/token-types';

import Token from '../tokens/token';

import type { TokenizeState } from "./tokenize";
import tokenizeArgument from './argument';
import tokenizeCondition from './condition';

import { ExpressionSyntaxError } from '../errors';

export default async (options: ParserOptions, meta: any, state: TokenizeState) : Promise<boolean> => {

    let { tokens, cursor, stack, meta: stateMeta } = state;

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
            cursor,
            stack: [...stack, args.length]
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
            throw new ExpressionSyntaxError('illegal character; expected end of argument', tokens[cursor].position);
        }

        isCondition = false;
    }

    if (cursor >= tokens.length) {
        throw new ExpressionSyntaxError('unexpected end');
    }

    if (tokens[cursor].value !== ']') {
        throw new ExpressionSyntaxError('illegal character; expected \]', tokens[cursor].position);
    }

    state.tokens = tokens;
    state.cursor = cursor + 1;
    state.output = args;

    return true;
};