import type { GenericToken, TokenizeOptions, TokenizeResult } from '../../types';

import type BaseToken from '../base-token';
import IfToken from './token';

import tokenizeArgument from '../arguments/argument';
import tokenizeComparison from '../comparison/tokenize';
import tokenizeLogicOperator from '../logic/tokenize';
import tokenizeWhitespace from '../whitespace/tokenize';

import { ExpressionArgumentsError, ExpressionSyntaxError } from '../../errors';

export default (tokens: GenericToken[], cursor: number, options: TokenizeOptions) : TokenizeResult<IfToken> => {
    const count = tokens.length;

    if (
        cursor + 1 >= count ||
        tokens[cursor].value !== '$' ||
        tokens[cursor + 1].value !== 'if'
    ) {
        return [false];
    }

    const start = cursor;
    cursor += 2;

    if (cursor >= count || tokens[cursor].value !== '[') {
        throw new ExpressionArgumentsError('$if requires atleast 2 arguments', tokens[cursor].position, 0, 'if');
    }
    cursor += 1;


    const consumeWS = () : undefined | string => {
        const [tokenized, tCursor, ws] = tokenizeWhitespace(tokens, cursor);
        if (tokenized) {
            cursor = tCursor as number;
        }
        return ws;
    }
    consumeWS();

    // condition
    let [tokenize, tCursor, tResult] : [tokenize: boolean, tCursor?: number, tResult?: BaseToken] = tokenizeLogicOperator(tokens, cursor, options);
    if (!tokenize) {
        [tokenize, tCursor, tResult] = tokenizeComparison(tokens, cursor, options);
    }
    if (!tokenize) {
        throw new ExpressionArgumentsError('$if requires the first argument to be a conditional', tokens[cursor].position, 0, 'if');
    }
    const condition = tResult as BaseToken;
    cursor = tCursor as number;
    if (cursor >= count) {
        throw new ExpressionSyntaxError('unexpected end of expression');
    }
    if (tokens[cursor].value !== ',') {
        throw new ExpressionSyntaxError('expected end of conditional', tokens[cursor].position);
    }
    cursor += 1;
    consumeWS();

    // whenTrue
    const [wtTokenize, wtCursor, whenTrue] = tokenizeArgument(tokens, cursor, options);
    if (!wtTokenize) {
        throw new ExpressionArgumentsError('$if must have atleast a condition and 1 parameter', tokens[cursor].position, 1, 'if');

    } else if (<number>wtCursor >= count) {
        throw new ExpressionSyntaxError('unexpected end of expression');

    } else {
        cursor = wtCursor as number;
    }

    // when false
    let wfTokenize : boolean,
        wfCursor: undefined | number,
        whenFalse: undefined | BaseToken;
    if (tokens[cursor].value === ',') {
        [wfTokenize, wfCursor, whenFalse] = tokenizeArgument(tokens, cursor + 1, options);
        if (!wfTokenize) {
            throw new ExpressionSyntaxError('expected 3rd parameter');
        }
        if (<number>wfCursor >= count) {
            throw new ExpressionSyntaxError('unexpected end of expression');
        }
        cursor = wfCursor as number;
    }
    if (tokens[cursor].value !== ']') {
        throw new ExpressionSyntaxError('expected end of arguments list', tokens[cursor].position);
    }

    return [
        true,
        cursor + 1,
        new IfToken({
            position: start,
            condition,
            whenTrue,
            whenFalse
        })
    ];
}