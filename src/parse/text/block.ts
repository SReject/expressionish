import type BaseToken from '../base-token';
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

        let tokenized: boolean, tokenizedCursor: undefined | number, tokenizedResult : undefined | BaseToken;

        [tokenized, tokenizedCursor, tokenizedResult] = tokenizeLookup(tokens, cursor,  options);
        if (tokenized) {
            result.add(tokenizedResult as BaseToken);
            cursor = tokenizedCursor as number;
            continue;
        }

        [tokenized, tokenizedCursor, tokenizedResult] = tokenizeIf(tokens, cursor, options);
        if (tokenized) {
            result.add(tokenizedResult as BaseToken);
            cursor = tokenizedCursor as number;
            continue;
        }

        [tokenized, tokenizedCursor, tokenizedResult] = tokenizeVariable(tokens, cursor, options);
        if (tokenized) {
            result.add(tokenizedResult as BaseToken);
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