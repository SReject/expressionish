import { tokenize as split } from '../../misc/split';

import type BaseToken from '../base-token';
import RootToken from './token';
import TextToken from '../text/token';

import tokenizeEscape from '../text/escape';
import tokenizeIf from '../if/tokenize';
import tokenizeLookup from '../lookup/tokenize';
import tokenizeVariable from '../variable/tokenize';

export default (options: TokenizeOptions) : RootToken => {

    const result = new RootToken(options);

    const tokens = split(options.expression);
    const count = tokens.length;
    let cursor = 0;

    while (cursor < count) {
        const [eTokenized, eCursor, eResult] = tokenizeEscape(tokens, cursor);
        if (eTokenized) {
            result.add(new TextToken(eResult));
            cursor = eCursor;
            continue;
        }

        let [tokenized, tCursor, tResult] : [tokenized: boolean, cursor?: number, result?: BaseToken] = tokenizeLookup(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as BaseToken);
            cursor = tCursor as number;
            continue
        }

        [tokenized, tCursor, tResult] = tokenizeIf(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as BaseToken);
            cursor = tCursor as number;
            continue
        }

        [tokenized, tCursor, tResult] = tokenizeVariable(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as BaseToken);
            cursor = tCursor as number;
            continue
        }

        result.add(new TextToken(tokens[cursor]));
        cursor += 1;
    }

    return result;
};