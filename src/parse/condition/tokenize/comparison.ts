import { consume as consumeWS } from '../../../helpers/whitespace';

import type ITokenizeState from '../../../types/tokenize-state';

import {
    ArgumentsQuantifier,
    type IOperator,
    comparisonOperators,
    OperatorToken,
} from '../operators'

import Token from '../../token';

import tokenizeOperand, { type IOperandState } from './operand';

import tokenizeOperator, { type IOperatorState } from './operator';

export default async (state: ITokenizeState, asArgument = true) : Promise<boolean> => {
    const { options, stack } = state;
    let { tokens, cursor } = state;

    cursor = consumeWS(tokens, cursor);

    if (
        cursor >= tokens.length ||
        tokens[cursor].value === ']' ||
        (asArgument && tokens[cursor].value === ',') ||
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

    let operator : void | IOperator = undefined;

    const leftCheck = await tokenizeOperand(
        mockState,
        asArgument,
        async (state: IOperandState, asArgument: boolean) : Promise<boolean> => {
            const { options, stack, operand, tokens, cursor } = state;

            const mockState : IOperatorState = {
                options: { ...options },
                stack: [ ...stack ],
                tokens: [ ...tokens ],
                cursor
            };

            if (
                !operand.tokens.length ||
                !operand.leadingWhitespace ||
                !(await tokenizeOperator(mockState, asArgument))
            ) {
                return false;
            }

            operator = mockState.output;
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

    if (operator == null) {
        operator = comparisonOperators.get('exists');
        cursor = consumeWS(tokens, cursor);
    }

    let right : undefined | Token;

    const argQuant = (<IOperator>operator).arguments;
    if (argQuant !== ArgumentsQuantifier.LEFTONLY) {
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

        } else if (argQuant === ArgumentsQuantifier.RIGHTREQUIRED) {
            throw new Error('TODO - SyntaxError: Right hand expression expected');
        }
    }
    const args : Token[] = [left];
    if (right) {
        args.push(right);
    }

    if (
        cursor >= tokens.length ||
        tokens[cursor].value === ']' ||
        (asArgument && tokens[cursor].value === ',')
    ) {
        state.cursor = cursor;
        state.tokens = tokens;
        state.output = new OperatorToken({
            position: startPosition,
            value: (<IOperator>operator).name,
            argumentsQuantifier: (<IOperator>operator).arguments,
            arguments: args,
            handle: (<IOperator>operator).handle
        });
        return true;
    }

    // TODO - custom error - Illegal character
    throw new Error('TODO - SyntaxError: illegal character');
}