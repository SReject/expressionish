import type { ComparisonOperatorMap, GenericToken, TokenizeOptions, TokenizeResult } from '../../types';
import type IfToken from '../if/token';
import type LookupToken from '../lookup/token';
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
import { ExpressionArgumentsError, ExpressionSyntaxError } from '../../errors';


interface TokenizeOperatorOptions extends TokenizeOptions {
    operators: ComparisonOperatorMap
}

const tokenizeOperator = (tokens: GenericToken[], cursor: number, options: TokenizeOperatorOptions) : [success: false ] | [success: true, cursor: number, result: string ]=> {
    const count = tokens.length;
    if (
        cursor >= count ||
        tokens[cursor].value === ',' ||
        tokens[cursor].value === ']' ||
        /^\s/.test(tokens[cursor].value)
    ) {
        return [false];
    }

    let operator : string = '';
    if (tokens[cursor].value === '!') {
        operator = '!';
        cursor += 1;
        if (
            cursor >= count ||
            tokens[cursor].value === ',' ||
            tokens[cursor].value === ']' ||
            /^\s/.test(tokens[cursor].value)
        ) {
            return [false];
        }
    }

    // text operator, such as 'isnumber'
    if (/^[a-z]+$/i.test(tokens[cursor].value)) {
        operator += tokens[cursor].value.toLowerCase();
        cursor += 1;

    // punctuation operator, such as ==
    } else {
        let operatorAccumulator = operator;
        let tmpCursor = cursor;
        while (tmpCursor < count) {
            if (!/^[\x21-\x2F\x3A-\x40\x5E-\x60]$/.test(tokens[tmpCursor].value)) {
                break;
            }

            operatorAccumulator += tokens[tmpCursor].value;
            tmpCursor += 1;

            if (options.operators.has(operatorAccumulator)) {
                operator = operatorAccumulator;
                cursor = tmpCursor;
            }
        }
    }


    if (
        cursor >= count ||
        !options.operators.has(operator) ||
        (
            tokens[cursor].value !== ',' &&
            tokens[cursor].value !== ']' &&
            !/^\s+$/.test(tokens[cursor].value)
        )
    ) {
        return [false];
    }


    const [wsRem, wsCursor] = tokenizeWhitespace(tokens, cursor);
    if (wsRem) {
        cursor = wsCursor as number;
    }
    return [true, cursor, operator];
}

export default (tokens: GenericToken[], cursor: number, options: TokenizeOptions) : TokenizeResult<ComparisonToken> => {
    const count = tokens.length;

    // nothing to parse
    if (
        cursor >= count ||
        tokens[cursor].value === ',' ||
        tokens[cursor].value === ']'
    ) {
        return [false];
    }

    const mergedOperators : ComparisonOperatorMap = new Map(operators);
    if (options.comparisonOperators) {
        options.comparisonOperators.forEach((operator, key) => {
            mergedOperators.set(key, operator);
        });
    }


    const start = tokens[cursor].position;

    const consumeWS = () => {
        const [wsRem, wsCursor, wsResult] = tokenizeWhitespace(tokens, cursor);
        if (wsRem) {
            cursor = wsCursor as number;
            return wsResult as string;
        }
        return ''
    }
    // consumeWS(); - leading whitespace should have been consumed by caller


    const left = new SequenceToken({ position: start });
    let operator : undefined | string;
    let right : SequenceToken | undefined;
    while (cursor < count) {
        const position = cursor;
        const ws = consumeWS();

        // end of conditional sequence
        if (
            cursor >= count
            || tokens[cursor].value === ','
            || tokens[cursor].value === ']'
        ) {
            break;
        }

        if (left.value.length > 0 && operator == null && ws !== '') {
            const [opTokenized, opCursor, opResult] = tokenizeOperator(tokens, cursor, { ...options, operators: mergedOperators });
            if (opTokenized) {
                if (left.value.length === 0) {
                    throw new ExpressionSyntaxError('left operand not specified', start);
                }

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

    if (!left.value.length) {
        return [false];
    }
    operator = operator || 'istruthy';

    if (
        operators.get(operator)?.maxArgumentsCount === 1
        && right != null
        && (
            !(right instanceof SequenceToken) ||
            right.value.length !== 0
        )
    ) {
        throw new ExpressionArgumentsError(`comparison operator ${operator} must not have a right-hand-side value`);
    }
    if (
        operators.get(operator)?.minArgumentsCount === 2
        && (
            right == null ||
            (right instanceof SequenceToken && right.value.length === 0)
        )
    ) {
        throw new ExpressionArgumentsError(`comparison operator ${operator} requires a right-hand-side value`);
    }
    return [
        true,
        cursor,
        new ComparisonToken({
            position: start,
            value: operator,
            left: left.unwrap,
            right: right ? right.unwrap : undefined
        })
    ]
}