import type { GenericToken, TokenizeOptions, TokenizeResult } from '../../types';
import type IfToken from '../if/token';
import type LookupToken from '../lookup/token';
import type VariableToken from '../variable/token';

import SequenceToken from '../sequence-token';
import TextToken from './token';

import tokenizeLookup from '../lookup/tokenize';
import tokenizeIf from '../if/tokenize';
import tokenizeVariable from '../variable/tokenize';

/** Attempts to consume a block-escape sequence from `tokens` starting at `cursor` */
export default (
    /** List of generic tokens to be tokenized into Token instances */
    tokens: GenericToken[],

    /** Current position within the tokens list */
    cursor: number,

    /** Options passed to initial tokenize() call */
    options: TokenizeOptions
) : TokenizeResult<LookupToken | IfToken | VariableToken | TextToken | SequenceToken> => {
    const count = tokens.length;
    if ((cursor + 1) >= count || tokens[cursor].value !== '``') {
        return [false];
    }

    cursor += 1;
    const result = new SequenceToken({ position: tokens[cursor].position });

    while (cursor < count) {
        if (tokens[cursor].value === '``') {
            return [true, cursor + 1, result.unwrap];
        }

        let [tokenized, tCursor, tResult] : [success: boolean, cursor?: number, result?: LookupToken | IfToken | VariableToken] = tokenizeLookup(tokens, cursor,  options);
        if (tokenized) {
            result.add(tResult as LookupToken);
            cursor = tCursor as number;
            continue;
        }

        [tokenized, tCursor, tResult] = tokenizeIf(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as IfToken);
            cursor = tCursor as number;
            continue;
        }

        [tokenized, tCursor, tResult] = tokenizeVariable(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as VariableToken);
            cursor = tCursor as number;
            continue;
        }

        result.add(new TextToken(tokens[cursor]));
        cursor += 1;
    }

    return [false];
}