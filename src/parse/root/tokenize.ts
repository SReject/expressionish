import type { GenericToken, TokenizeOptions } from '../../types';
import type IfToken from '../if/token';
import type LookupToken from '../lookup/token';
import type SequenceToken from '../sequence-token';
import type VariableToken from '../variable/token';

import { tokenize as split } from '../../misc/split';

import RootToken from './token';
import TextToken from '../text/token';

import tokenizeBlockEscape from '../text/block';
import tokenizeEscape from '../text/escape';
import tokenizeIf from '../if/tokenize';
import tokenizeLookup from '../lookup/tokenize';
import tokenizeVariable from '../variable/tokenize';

/** Attempts to tokenize the given expression into Token instances */
export default (
    /** Options passed to initial tokenize() call */
    options: TokenizeOptions
) : RootToken => {

    const result = new RootToken(options);

    const tokens = split(options.expression);
    const count = tokens.length;
    let cursor = 0;

    while (cursor < count) {

        const [eTokenized, eCursor, eResult] = tokenizeEscape(tokens, cursor);
        if (eTokenized) {
            result.add(new TextToken(eResult as GenericToken));
            cursor = eCursor as number;
            continue;
        }

        let [tokenized, tCursor, tResult] : [tokenized: boolean, cursor?: number, result?: LookupToken | IfToken | VariableToken | TextToken | SequenceToken] = tokenizeBlockEscape(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as LookupToken | IfToken | VariableToken | TextToken | SequenceToken);
            cursor = tCursor as number;
            continue;
        }

        [tokenized, tCursor, tResult] = tokenizeLookup(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as LookupToken);
            cursor = tCursor as number;
            continue
        }

        [tokenized, tCursor, tResult] = tokenizeIf(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as IfToken);
            cursor = tCursor as number;
            continue
        }

        [tokenized, tCursor, tResult] = tokenizeVariable(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as VariableToken);
            cursor = tCursor as number;
            continue
        }
        result.add(new TextToken(tokens[cursor]));
        cursor += 1;
    }

    return result;
};