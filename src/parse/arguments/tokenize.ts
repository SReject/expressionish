import type BaseToken from '../base-token';
import type SequenceToken from '../sequence-token';

import ArgumentsToken from './token'

import tokenizeArgument from './argument';
import tokenizeWhitespace from '../whitespace/tokenize';

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

        // get next argument
        const [aTokenized, aCursor, aResult] = tokenizeArgument(tokens, cursor, options);
        if (!aTokenized) {
            throw new Error('invalid argument');
        }
        cursor = aCursor as number;
        if (cursor >= count) {
            throw new Error('unexpected end of expression')
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
            throw new Error('expected end of argument')
        }
        cursor += 1;
    }


    if (cursor >= count) {
        throw new Error('unexpected end of expression');
    }

    throw new Error('unexpected end of arguments list');
}