import type { GenericToken, TokenizeOptions, TokenizeResult } from '../../types';

import IfToken from '../if/token';
import LookupToken from '../lookup/token';
import SequenceToken from '../sequence-token';
import TextToken from '../text/token';
import VariableToken from '../variable/token';

import tokenizeQuote from '../text/quote';
import tokenizeEscape from '../text/escape';
import tokenizeBlockEscape from '../text/block';
import tokenizeLookup from '../lookup/tokenize';
import tokenizeIf from '../if/tokenize';
import tokenizeVariable from '../variable/tokenize';
import tokenizeWhitespace from '../whitespace/tokenize';

import { ExpressionSyntaxError } from '../../errors';

export default (tokens: GenericToken[], cursor: number, options: TokenizeOptions) : TokenizeResult<LookupToken | IfToken | VariableToken | TextToken | SequenceToken> => {
    const count = tokens.length;

    if (cursor >= count) {
        return [false];
    }

    const start = tokens[cursor].position;

    const consumeWhitespace = () => {
        const [wsRem, wsCursor, wsResult] = tokenizeWhitespace(tokens, cursor);
        if (wsRem) {
            cursor = wsCursor as number;
            return wsResult as string;
        }
        return '';
    }
    consumeWhitespace();
    if (cursor >= count) {
        return [false];
    }

    const parts = new SequenceToken({ position: start });
    while (cursor < count) {
        const position = tokens[cursor].position;
        const whitespace = consumeWhitespace();

        // End of argument
        if (
            tokens[cursor].value === ']' ||
            tokens[cursor].value === ','
        ) {
            return [true, cursor, parts.unwrap];
        }

        // Whitespace is between 'parts' so must be kept
        parts.add(new TextToken({ position, value: whitespace}));

        // Single-char escape
        const [eTokenized, eCursor, eResult] = tokenizeEscape(tokens, cursor, '"$,\\`]');
        if (eTokenized) {
            parts.add(new TextToken({ position, value: (eResult as GenericToken).value}));
            cursor = eCursor as number;
        }

        // Block escape
        let [tokenized, tCursor, tResult] : [ tokenized: boolean, cursor?: number, result?: LookupToken | IfToken | VariableToken | TextToken | SequenceToken ] = tokenizeBlockEscape(tokens, cursor, options);
        if (tokenized) {
            parts.add(tResult as SequenceToken);
            cursor = tCursor as number;
            continue;
        }

        // Quoted text
        [tokenized, tCursor, tResult] = tokenizeQuote(tokens, cursor);
        if (tokenized) {
            parts.add(tResult as TextToken);
            cursor = tCursor as number;
            continue;
        }

        // Lookup
        [tokenized, tCursor, tResult] = tokenizeLookup(tokens, cursor, options);
        if (tokenized) {
            parts.add(tResult as LookupToken);
            cursor = tCursor as number;
            continue;
        }

        // $if
        [tokenized, tCursor, tResult] = tokenizeIf(tokens, cursor, options);
        if (tokenized) {
            parts.add(tResult as IfToken);
            cursor = tCursor as number;
            continue;
        }

        // Variable
        [tokenized, tCursor, tResult] = tokenizeVariable(tokens, cursor, options);
        if (tokenized) {
            parts.add(tResult as VariableToken);
            cursor = tCursor as number;
            continue;
        }

        // All other situations treat the generic token as plain text
        parts.add(new TextToken(tokens[cursor]));
        cursor += 1;
    }

    throw new ExpressionSyntaxError('unexpected end of arguments list')
}