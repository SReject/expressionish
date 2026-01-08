import type { GenericToken, TokenizeOptions, TokenizeResult } from '../../types';
import type IfToken from '../if/token';
import type LookupToken from '../lookup/token';
import type SequenceToken from '../sequence-token';
import type TextToken from '../text/token';
import type VariableToken from '../variable/token';

import ArgumentsToken from './token'

import tokenizeArgument from '../argument/tokenize';
import tokenizeWhitespace from '../whitespace/tokenize';

import { ExpressionSyntaxError } from '../../errors';

/** Attempts to consume an arguments-bloc from `tokens` starting at `cursor` */
export default (

    /** List of generic tokens to be tokenized into Token instances */
    tokens: GenericToken[],

    /** Current position within the tokens list */
    cursor: number,

    /** Options passed to the initial `tokenize()` call */
    options: TokenizeOptions
) : TokenizeResult<ArgumentsToken> => {
    const count = tokens.length;

    if (cursor >= count || tokens[cursor].value !== '[') {
        return [false];
    }

    const start = tokens[cursor].position;
    cursor += 1;

    const consumeWS = () => {
        const [wsRem, wsCursor, wsResult] = tokenizeWhitespace(tokens, cursor);
        if (wsRem) {
            cursor = wsCursor as number;
            return wsResult as string;
        }
        return ''
    }
    consumeWS();

    const args : Array<LookupToken | IfToken | VariableToken | TextToken | SequenceToken> = [];
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
        args.push(aResult as (LookupToken | IfToken | VariableToken | TextToken | SequenceToken));

        if (cursor >= count) {
            break;
        }

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