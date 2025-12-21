import type { GenericToken, LogicOperator, TokenizeOptions, TokenizeResult } from '../../types';
import type ComparisonToken from '../comparison/token';
import type IfToken from '../if/token';
import type LookupToken from '../lookup/token';
import type SequenceToken from '../sequence-token';
import type TextToken from '../text/token';
import type VariableToken from '../variable/token';

import ArgumentsToken from '../arguments/token';
import LogicToken from './token'

import tokenizeWhitespace from '../whitespace/tokenize';
import tokenizeComparison from '../comparison/tokenize';

import operators from './operators';
import { ExpressionArgumentsError, ExpressionSyntaxError } from '../../errors';

/** Attempts to consume a Logic Operator from `tokens` starting at `cursor` */
const tokenizeLogicOperator = (

    /** List of generic tokens to be tokenized into Token instances */
    tokens: GenericToken[],

    /** Current position within the tokens list */
    cursor: number,

    /** Options passed to the `tokenize()` call */
    options: TokenizeOptions
) : TokenizeResult<LogicToken> => {
    const count = tokens.length;


    if (cursor + 1 >= count || tokens[cursor].value !== '$') {
        return [false];
    }
    const start = tokens[cursor].position;
    cursor += 1;

    const mergedOperators = new Map(operators);
    if (options.logicalOperators) {
        options.logicalOperators.forEach((operator, key) => {
            mergedOperators.set(key, operator);
        });
    }
    let operator : string;
    if (mergedOperators.has(tokens[cursor].value)) {
        operator = tokens[cursor].value;
        cursor += 1;
        if (cursor >= count) {
            return [false];
        }
    } else {
        return [false];
    }

    if (tokens[cursor].value !== '[') {
        throw new ExpressionSyntaxError('Logic Operators require atleast one argument', tokens[cursor].position);
    }
    const argsStart = tokens[cursor].position;
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

    const args : Array<LookupToken | IfToken | VariableToken | TextToken | SequenceToken> = [];
    while (cursor < count) {

        consumeWS();

        if (cursor >= count) {
            break;
        }

        let [tokenize, tCursor, tResult] : [tokenize: boolean, tCursor?: number, tResult?: LogicToken | ComparisonToken] = tokenizeLogicOperator(tokens, cursor, options);
        if (!tokenize) {
            [tokenize, tCursor, tResult] = tokenizeComparison(tokens, cursor, options);
        }
        if (!tokenize) {
            throw new ExpressionArgumentsError('conditional expected', tokens[cursor].position, args.length);
        }
        args.push(tResult as (LogicToken | ComparisonToken));
        cursor = tCursor as number;

        if (tokens[cursor].value === ',') {
            cursor += 1;
            continue;
        }

        if (tokens[cursor].value === ']') {
            const opDef = operators.get(operator) as LogicOperator;
            if (opDef.minArgumentsCount != null && args.length < opDef.minArgumentsCount) {
                throw new ExpressionArgumentsError(`$${operator} expects atleast ${opDef.minArgumentsCount} argument(s)`);
            }
            if (opDef.maxArgumentsCount != null && args.length > opDef.maxArgumentsCount) {
                throw new ExpressionArgumentsError(`$${operator} expects at most ${opDef.maxArgumentsCount} argument(s)`);
            }
            return [
                true,
                cursor + 1,
                new LogicToken({
                    position: start,
                    value: operator,
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