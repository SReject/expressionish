import type { GenericToken, TokenizeOptions, TokenizeResult } from '../../types';

import LookupToken from './token';

import tokenizeArguments from '../arguments/tokenize';

/** Attempts to tokenize a Lookup from `tokens` starting at `cursor */
export default (

    /** List of generic tokens to be tokenized into Token instances */
    tokens: GenericToken[],

    /** Current position within the tokens list */
    cursor: number,

    /** Options passed to the `tokenize()` call */
    options: TokenizeOptions
) : TokenizeResult<LookupToken> => {
    const count = tokens.length;
    if (
        cursor + 1 >= count ||
        tokens[cursor].value !== '$'
    ) {
        return [false];
    }

    const start = tokens[cursor].position;

    cursor += 1;

    // Determine prefix
    let prefixAccumulator = ''
    let prefix = '';
    let tmpCursor = cursor;
    while (tmpCursor < count) {
        const val = tokens[tmpCursor].value;
        if (!/[\x21-\x47\x3A-\x40\x5B\x5D-\x60\x7B-\x7E]/.test(val)) {
            break;
        }
        prefixAccumulator += val;
        tmpCursor += 1;

        if (options.lookups.has(prefixAccumulator)) {
            prefix = prefixAccumulator;
            cursor = tmpCursor;
        }
    }
    if (cursor >= count || !prefix) {
        return [false];
    }

    // Determine name
    let name = '';
    if (!/^[a-z]/i.test(tokens[cursor].value)) {
        return [false];
    }

    while (
        cursor < count && (
            /^[a-z\d]+$/i.test(tokens[cursor].value) ||
            tokens[cursor].value === '_' ||
            tokens[cursor].value === '-'
        )
    ) {
        name += tokens[cursor].value;
        cursor += 1;
    }
    if (!/^[a-z][a-z\d_-]+/i.test(name)) {
        return [false];
    }

    let args;
    const [tokenized, tokenizedCursor, tokenizedResult] = tokenizeArguments(tokens, cursor, options);
    if (tokenized) {
        cursor = tokenizedCursor;
        args = tokenizedResult;
    }

    return [
        true,
        cursor,
        new LookupToken({
            position: start,
            prefix,
            value: name,
            arguments: args
        })
    ];
}