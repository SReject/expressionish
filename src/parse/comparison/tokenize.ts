import type { GenericToken, TokenizeOptions, TokenizeResult } from '../../types';
import type IfToken from '../if/token';
import type VariableToken from '../variable/token';

import ComparisonToken from './token';
import SequenceToken from '../sequence-token';
import TextToken from '../text/token';

import tokenizeEscape from '../text/escape';
import tokenizeIf from '../if/tokenize';
import tokenizeLookup from '../lookup/tokenize';
import tokenizeQuote from '../text/quote';
import tokenizeVariable from '../variable/tokenize';
import tokenizeWhitespace from '../whitespace/tokenize';

import operators from './operators';
import LookupToken from '../lookup/token';

const tokenizeOperator = (tokens: GenericToken[], cursor: number) : [success: false ] | [success: true, cursor: number, result: string ]=> {
    const count = cursor;
    if (cursor >= count) {
        return [false];
    }

    const consumeWS = () => {
        const [wsRem, wsCursor, wsResult] = tokenizeWhitespace(tokens, cursor);
        if (wsRem) {
            cursor = wsCursor as number;
            return wsResult as string;
        }
        return ''
    }

    let negated = false;
    if (tokens[cursor].value === '!') {
        negated = true;
        cursor += 1;
    }
    if (
        cursor >= count ||
        tokens[cursor].value === ',' ||
        tokens[cursor].value === ']' ||
        /^\s/.test(tokens[cursor].value)
    ) {
        return [false];
    }

    let operator : string = '';

    // text operator, such as 'isnumber'
    if (/^[a-z]+$/i.test(tokens[cursor].value)) {
        operator = (negated ? '!' : '') + tokens[cursor].value.toLowerCase();
        cursor += 1;

    // punctuation operator, such as ==
    } else {
        while (cursor < count) {
            if (!/^[\x21-\x2F\x3A-\x40\x5E-\x60]$/.test(tokens[cursor].value)) {
                return [false];
            }
            operator += tokens[cursor].value;
            if (operators.has(operator)) {
                operator += tokens[cursor].value
                break;
            }
            cursor += 1;
        }
    }

    if (
        cursor >= count ||
        !operators.has(operator) ||
        (
            tokens[cursor].value !== ',' &&
            tokens[cursor].value !== ']' &&
            !/^\s+$/.test(tokens[cursor].value)
        )
    ) {
        return [false];
    }

    consumeWS();
    return [true, cursor, operator];
}

export default (tokens: GenericToken[], cursor: number, options: TokenizeOptions) : TokenizeResult<ComparisonToken> => {
    const count = tokens.length;

    if (cursor >= count || tokens[cursor].value === ',' || tokens[cursor].value === ']') {
        return [false];
    }

    const start = cursor;

    const left = new SequenceToken({ position: start });
    let operator : undefined | string;
    let right : undefined | SequenceToken;

    const consumeWS = () => {
        const [wsRem, wsCursor, wsResult] = tokenizeWhitespace(tokens, cursor);
        if (wsRem) {
            cursor = wsCursor as number;
            return wsResult as string;
        }
        return ''
    }
    consumeWS();

    while (cursor < count) {
        const position = cursor;
        const ws = consumeWS() || '';

        if (
            cursor >= count ||
            tokens[cursor].value === ',' ||
            tokens[cursor].value === ']'
        ) {
            break;
        }

        if (operator == null && ws !== '') {
            const [opTokenized, opCursor, opResult] = tokenizeOperator(tokens, cursor);
            if (opTokenized) {
                cursor = opCursor as number;
                operator = opResult as string;
                right = new SequenceToken({ position: cursor });
                continue;
            }
        }

        const parts = right ? right : left;

        if (ws !== '') {
            parts.add(new TextToken({ position, value: ws }));
        }

        // Single-char escape
        const [eTokenized, eCursor, eResult] = tokenizeEscape(tokens, cursor, '"$,\\`]');
        if (eTokenized) {
            parts.add(new TextToken({ position, value: (eResult as GenericToken).value}));
            cursor = eCursor as number;
        }

        // Quoted text
        let [tokenized, tCursor, tResult] : [ tokenized: boolean, cursor?: number, result?: LookupToken | IfToken | VariableToken | TextToken ] = tokenizeQuote(tokens, cursor);
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
    if (
        cursor >= count ||
        operator == null ||
        (
            tokens[cursor].value !== ',' &&
            tokens[cursor].value !== ']'
        )
    ) {
        return [false];
    }

    let uright: undefined | LookupToken | IfToken | VariableToken | TextToken | SequenceToken;
    if (right) {
        uright = right.unwrap;
        if (uright.type === 'UNDEFINED') {
            uright = undefined;
        }
    }

    return [
        true,
        cursor,
        new ComparisonToken({
            position: start,
            value: operator,
            left,
            right: uright
        })
    ];
}