import type { GenericToken, TokenizeOptions, TokenizeResult } from '../../types';
import type ComparisonToken from '../comparison/token';
import type LogicToken from '../logic/token';
import type LookupToken from '../lookup/token';
import type SequenceToken from '../sequence-token';
import type TextToken from '../text/token';
import type VariableToken from '../variable/token';
type ConditionToken = ComparisonToken | LogicToken;

import IfToken from './token';

import tokenizeArgument from '../argument/tokenize';
import tokenizeComparison from '../comparison/tokenize';
import tokenizeLogicOperator from '../logic/tokenize';
import tokenizeWhitespace from '../whitespace/tokenize';

import { ExpressionArgumentsError, ExpressionSyntaxError } from '../../errors';

/** Attempts to consume an If Statement from `tokens` starting at `cursor` */
export default (

    /** List of generic tokens to be tokenized into Token instances */
    tokens: GenericToken[],

    /** Current position within the tokens list */
    cursor: number,

    /** Options passed to the `tokenize()` call */
    options: TokenizeOptions
) : TokenizeResult<IfToken> => {
    const count = tokens.length;

    if (
        cursor + 1 >= count ||
        tokens[cursor].value !== '$' ||
        tokens[cursor + 1].value !== 'if'
    ) {
        return [false];
    }

    const start = tokens[cursor].position;
    cursor += 2;

    if (cursor >= count) {
        throw new ExpressionArgumentsError('$if requires atleast 2 arguments', start, 0, 'if');
    }

    if (tokens[cursor].value !== '[') {
        throw new ExpressionArgumentsError('$if requires atleast 2 arguments', tokens[cursor].position, 0, 'if');
    }
    cursor += 1;


    const consumeWS = (notEnd?: boolean) : undefined | string => {
        const [tokenized, tCursor, ws] = tokenizeWhitespace(tokens, cursor);
        if (tokenized) {
            cursor = tCursor as number;
        }
        if (notEnd && cursor >= count) {
            throw new ExpressionSyntaxError('unexpected end of expression');
        }
        return ws;
    }
    consumeWS(true);

    // condition
    let [tokenize, tCursor, tResult] : [tokenize: boolean, tCursor?: number, tResult?: ConditionToken ] = tokenizeLogicOperator(tokens, cursor, options);
    if (!tokenize) {
        [tokenize, tCursor, tResult] = tokenizeComparison(tokens, cursor, options);
        if (!tokenize) {
            throw new ExpressionArgumentsError('$if requires the first argument to be a conditional', tokens[cursor].position, 0, 'if');
        }
    }
    const condition = tResult as ConditionToken;
    cursor = tCursor as number;

    // , expected after condition
    if (cursor >= count) {
        throw new ExpressionSyntaxError('unexpected end of expression');
    }
    if (tokens[cursor].value === ']') {
        throw new ExpressionArgumentsError('$if requires atleast 2 arguments', tokens[cursor].position, 2, 'if');
    }
    if (tokens[cursor].value !== ',') {
        throw new ExpressionSyntaxError('expected end of conditional', tokens[cursor].position);
    }
    cursor += 1;
    consumeWS(true);

    // whenTrue
    if (cursor >= count) {
        throw new ExpressionSyntaxError('unexpected end of expression');
    }
    const [wtTokenize, wtCursor, whenTrue] = tokenizeArgument(tokens, cursor, options);
    if (!wtTokenize) {
        throw new ExpressionArgumentsError('$if must have atleast a condition and 1 parameter', tokens[cursor].position, 1, 'if');

    } else {
        cursor = wtCursor as number;
        if (cursor >= count) {
            throw new ExpressionSyntaxError('unexpected end of expression');
        }
    }

    // when false
    let wfTokenize : boolean,
        wfCursor: undefined | number,
        whenFalse: undefined | LookupToken | IfToken | VariableToken | TextToken | SequenceToken;
    if (tokens[cursor].value === ',') {

        // consume , and trailing whitespace
        cursor += 1;
        consumeWS(true);

        if (tokens[cursor].value !== ']') {
            [wfTokenize, wfCursor, whenFalse] = tokenizeArgument(tokens, cursor, options);
            if (!wfTokenize) {
                throw new ExpressionSyntaxError('expected 3rd parameter');
            }
            cursor = wfCursor as number;
            if (cursor >= count) {
                throw new ExpressionSyntaxError('unexpected end of expression');
            }
        }
    }

    // end of arguments
    if (tokens[cursor].value !== ']') {
        throw new ExpressionSyntaxError('expected end of arguments list', tokens[cursor].position);
    }
    return [
        true,
        cursor + 1,
        new IfToken({
            position: start,
            value: condition,
            whenTrue,
            whenFalse
        })
    ];
}