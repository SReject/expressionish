import type { GenericToken, TokenizeOptions, TokenizeResult } from '../../types';

import VariableToken from './token';

import tokenizeArguments from '../arguments/tokenize';

export default (tokens: GenericToken[], cursor: number, options: TokenizeOptions) : TokenizeResult<VariableToken> => {

    const count = tokens.length;
    if (cursor + 1 >= count || tokens[cursor].value !== '$') {
        return [false];
    }

    const start = cursor;
    cursor += 1;

    // parse name
    const name = tokens[cursor].value;
    if (!/^[a-z][a-z\d]*/i.test(name)) {
        return [false];
    }
    cursor += 1;

    // parse arguments
    const [tokenized, tCursor, tResult] = tokenizeArguments(tokens, cursor, options);
    if (tokenized) {
        cursor = tCursor as number;
    }

    return [
        true,
        cursor,
        new VariableToken({
            position: start,
            value: name,
            arguments: tResult
        })
    ];

}