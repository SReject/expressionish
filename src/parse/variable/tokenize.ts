import type { GenericToken, TokenizeOptions, TokenizeResult } from '../../types';

import VariableToken from './token';

import tokenizeArguments from '../arguments/tokenize';

import { ExpressionVariableError } from '../../errors';

/** Attempts to consume a varaiable from `tokens` starting at `cursor` */
export default (

    /** List of generic tokens to be tokenized into Token instances */
    tokens: GenericToken[],

    /** Current position within the tokens list */
    cursor: number,

    /** Options passed to the `tokenize()` call */
    options: TokenizeOptions
) : TokenizeResult<VariableToken> => {

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
    if (!options.variables.has(name)) {
        throw new ExpressionVariableError('unknown variable', tokens[cursor].position, name);
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