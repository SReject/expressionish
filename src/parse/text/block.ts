import type { GenericToken, TokenizeOptions, TokenizeResult } from '../../types';
import type IfToken from '../if/token';
import type LookupToken from '../lookup/token';
import type VariableToken from '../variable/token';

import SequenceToken from '../sequence-token';
import TextToken from './token';

import tokenizeLookup from '../lookup/tokenize';
import tokenizeIf from '../if/tokenize';
import tokenizeVariable from '../variable/tokenize';

export default (tokens: GenericToken[], cursor: number, options: TokenizeOptions) : TokenizeResult<SequenceToken> => {
    const count = tokens.length;
    if ((cursor + 2) >= count || tokens[cursor].value !== '``') {
        return [false];
    }

    const result = new SequenceToken({ position: cursor });

    cursor += 1;

    while (cursor < count) {
        if (tokens[cursor].value === '``') {
            break;
        }

        let tokenized: boolean, tokenizedCursor: undefined | number, tokenizedResult : undefined | LookupToken | IfToken | VariableToken;

        [tokenized, tokenizedCursor, tokenizedResult] = tokenizeLookup(tokens, cursor,  options);
        if (tokenized) {
            result.add(tokenizedResult as LookupToken);
            cursor = tokenizedCursor as number;
            continue;
        }

        [tokenized, tokenizedCursor, tokenizedResult] = tokenizeIf(tokens, cursor, options);
        if (tokenized) {
            result.add(tokenizedResult as IfToken);
            cursor = tokenizedCursor as number;
            continue;
        }

        [tokenized, tokenizedCursor, tokenizedResult] = tokenizeVariable(tokens, cursor, options);
        if (tokenized) {
            result.add(tokenizedResult as VariableToken);
            cursor = tokenizedCursor as number;
            continue;
        }

        result.add(new TextToken(tokens[cursor]));
        cursor += 1;
    }

    if (cursor >= count || tokens[cursor].value !== '``') {
        return [false];
    }

    return [true, cursor + 1, result];
}