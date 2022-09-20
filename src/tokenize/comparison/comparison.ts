import type ITokenizeState from '../../types/tokenize-state';
import { ArgumentQuantifier } from '../../types/manifest-comparison';

import { consume as consumeWS, is as isWS } from '../../helpers/whitespace';

import tokenizeOperand, { IOperandState } from './operand';
import tokenizeComparator, { IComparatorState } from './comparator';

import comparatorMap, { IComparator } from './comparator-map';

import Token from '../../tokens/token';

export default async (state: ITokenizeState, asArgument = true) : Promise<boolean> => {
    const { options, stack } = state;
    let { tokens, cursor } = state;

    cursor = consumeWS(tokens, cursor);

    if (
        cursor >= tokens.length ||
        tokens[cursor].value === ']' ||
        (asArgument && tokens[cursor].value) === ',' ||
        tokens[cursor].value === '&&' ||
        tokens[cursor].value === '||'
    ) {
        return false;
    }

    const startPosition = tokens[cursor].position;

    const mockState : ITokenizeState = {
        options: { ...options },
        stack: [ ...stack ],
        tokens: [ ...tokens ],
        cursor
    };

    let comparator : void | IComparator = undefined;

    const leftCheck = await tokenizeOperand(
        mockState,
        asArgument,
        async (state: IOperandState, asArgument: boolean) : Promise<boolean> => {
            const { options, stack, operand, tokens, cursor } = state;

            const mockState : IComparatorState = {
                options: { ...options },
                stack: [ ...stack ],
                tokens: [ ...tokens ],
                cursor
            };

            if (
                !operand.tokens.length ||
                !operand.leadingWhitespace ||
                !(await tokenizeComparator(mockState, asArgument))
            ) {
                return false;
            }

            comparator = mockState.output;
            state.cursor = mockState.cursor;
            state.tokens = mockState.tokens;
            state.endOfOperand = true;

            return true;
        }
    );

    if (!leftCheck) {
        throw new Error('TODO - SyntaxError: Left hand expression expected');
    }
    const left = <Token>mockState.output;

    tokens = mockState.tokens;
    cursor = mockState.cursor;

    if (comparator == null) {
        comparator = comparatorMap.get('exists');
        cursor = consumeWS(tokens, cursor);
    }

    let right : undefined | Token;

    const argQuant = (<IComparator>comparator).arguments;
    if (argQuant !== ArgumentQuantifier.LEFTONLY) {
        const mockState : ITokenizeState = {
            options: { ...options },
            stack: [ ...stack ],
            tokens: [ ...tokens ],
            cursor
        }

        if (await tokenizeOperand(mockState, asArgument)) {
            tokens = mockState.tokens;
            cursor = consumeWS(tokens, mockState.cursor);
            right = <Token>mockState.output;

        } else if (argQuant === ArgumentQuantifier.RIGHTREQUIRED) {
            throw new Error('TODO - SyntaxError: Right hand expression expected');
        }
    }

    if (
        cursor >= tokens.length ||
        tokens[cursor].value === ']' ||
        (asArgument && tokens[cursor].value === ',')
    ) {
        state.cursor = cursor;
        state.tokens = tokens;
        state.output = new (<IComparator>comparator).tokenClass({
            position: startPosition,
            left,
            right
        });
        return true;
    }

    // TODO - custom error - Illegal character
    throw new Error('TODO - SyntaxError: illegal character');
}