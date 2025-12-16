import type { GenericToken, TokenizeOptions, TokenizeResult } from '../../types';

import type BaseToken from '../base-token';
import type SequenceToken from '../sequence-token';

import ArgumentsToken from './token'

import tokenizeArgument from './argument';
import tokenizeWhitespace from '../whitespace/tokenize';

import { ExpressionSyntaxError } from '../../errors';

export default (tokens: GenericToken[], cursor: number, options: TokenizeOptions) : TokenizeResult<ArgumentsToken> => {
    const count = tokens.length;

    if (cursor >= count || tokens[cursor].value !== '[') {
        return [false];
    }

    const start = cursor;

    const consumeWS = () => {
        const [wsRem, wsCursor, wsResult] = tokenizeWhitespace(tokens, cursor);
        if (wsRem) {
            cursor = wsCursor as number;
            return wsResult as string;
        }
        return ''
    }
    consumeWS();

    const args : Array<BaseToken | SequenceToken> = [];
    while (cursor < count) {
        consumeWS();
        if (cursor >= count) {
            break;
        }

        // get next argument
        const [aTokenized, aCursor, aResult] = tokenizeArgument(tokens, cursor, options);
        if (!aTokenized) {
            throw new ExpressionSyntaxError('encountered missing or invalid argument', tokens[cursor].position);
        }
        cursor = aCursor as number;
        if (cursor >= count) {
            break;
        }
        args.push(aResult as BaseToken);

        // End of arguments list
        if (tokens[cursor].value === ']') {
            return [
                true,
                cursor + 1,
                new ArgumentsToken({
                    position: start,
                    value: args
                })
            ];
        }

        if (tokens[cursor].value !== ',') {
            throw new ExpressionSyntaxError('expected end of argument', tokens[cursor].position);
        }
        cursor += 1;
    }


    if (cursor >= count) {
        throw new ExpressionSyntaxError('unexpected end of expression');
    }

    throw new ExpressionSyntaxError('unexpected end of arguments list', tokens[cursor].position);
}