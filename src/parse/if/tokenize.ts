import type BaseToken from '../base-token';
import IfToken from './token';

import tokenizeArgument from '../arguments/argument';
import tokenizeComparison from '../comparison/tokenize';
import tokenizeLogicOperator from '../logic/tokenize';
import tokenizeWhitespace from '../whitespace/tokenize';

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
        throw new Error('$if requires atleast 2 arguments');
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
        throw new Error('$if requires the first argument to be a conditional');
    }
    const condition = tResult as BaseToken;
    cursor = tCursor as number;
    if (cursor >= count) {
        throw new Error('unexpected end of expression');
    }
    if (tokens[cursor].value !== ',') {
        throw new Error('expected end of conditional');
    }
    cursor += 1;
    consumeWS();

    // whenTrue
    const [wtTokenize, wtCursor, whenTrue] = tokenizeArgument(tokens, cursor, options);
    if (!wtTokenize) {
        throw new Error('$if must have atleast a condition and 1 parameter');

    } else if (<number>wtCursor >= count) {
        throw new Error('unexpected end of expression');

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
            throw new Error('SYNTAX ERROR');
        }
        if (<number>wfCursor >= count) {
            throw new Error('unexpected end of expression');
        }
        cursor = wfCursor as number;
    }
    if (tokens[cursor].value !== ']') {
        throw new Error('expected end of arguments list');
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