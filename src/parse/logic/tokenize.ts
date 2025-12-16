import type BaseToken from '../base-token';
import type SequenceToken from '../sequence-token';
import ArgumentsToken from '../arguments/token';
import LogicToken from './token'

import tokenizeWhitespace from '../whitespace/tokenize';
import tokenizeComparison from '../comparison/tokenize';

import operators from './operators';
import { ExpressionSyntaxError } from '../../errors';

const tokenizeLogicOperator = (tokens: GenericToken[], cursor: number, options: TokenizeOptions) : TokenizeResult<LogicToken> => {
    const count = tokens.length;

    if (
        cursor + 1 >= count ||
        tokens[cursor].value !== '$' ||
        !operators.has('$' + tokens[cursor + 1].value)
    ) {
        return [false];
    }

    if ( cursor + 3 >= count || tokens[cursor + 2].value !== '[') {
        throw new ExpressionSyntaxError('Logic Operators require atleast one argument', tokens[cursor + 1].position);
    }

    const name = '$' + tokens[cursor + 1];

    const start = cursor;
    const argsStart = cursor + 2;
    cursor += 3;

    const consumeWS = () : undefined | string => {
        const [tokenized, tCursor, ws] = tokenizeWhitespace(tokens, cursor);
        if (tokenized) {
            cursor = tCursor as number;
        }
        return ws;
    }
    consumeWS();


    const args : Array<BaseToken | SequenceToken> = [];
    while (cursor < count) {

        consumeWS();

        if (cursor >= count) {
            break;
        }

        let [tokenize, tCursor, tResult] : [tokenize: boolean, tCursor?: number, tResult?: BaseToken] = tokenizeLogicOperator(tokens, cursor, options);
        if (!tokenize) {
            [tokenize, tCursor, tResult] = tokenizeComparison(tokens, cursor, options);
        }
        if (!tokenize) {
            throw new ExpressionSyntaxError('condition expected', tokens[cursor].position);
        }
        args.push(tResult as BaseToken);
        cursor = tCursor as number;

        if (tokens[cursor].value === ',') {
            cursor += 1;
            continue;
        }

        if (tokens[cursor].value === ']') {
            return [
                true,
                cursor + 1,
                new LogicToken({
                    position: start,
                    value: name,
                    arguments: new ArgumentsToken({
                        position: argsStart,
                        value: args
                    })
                })
            ];
        }

        throw new ExpressionSyntaxError('unexpected token', tokens[cursor].position);
    }

    throw new ExpressionSyntaxError('unexpected end of expression', count);
}
export default tokenizeLogicOperator;