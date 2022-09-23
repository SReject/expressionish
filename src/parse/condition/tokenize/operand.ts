import TokenType from '../../../types/token-types';
import type ITokenizeState from '../../../types/tokenize-state';

import { consume as consumeWS, is as isWS } from '../../../helpers/whitespace';

import {
    TextToken,
    tokenizeEscape,
    tokenizeEscapeBlock,
    tokenizeQuoted,
    tokenizeSpecial,
} from '../../text';

import { tokenizeIf } from '../../if';
import { tokenizeFunction } from '../../function';

import type Token from '../../token';
import TokenList from '../../token-list';

export interface IOperandState extends ITokenizeState {
    endOfOperand?: boolean;
    operand: {
        tokens: Token[];
        leadingWhitespace: boolean;
    };
}

type EndCheck = (state: IOperandState, asArgument: boolean) => Promise<boolean>;

export default async (
    state: ITokenizeState,
    asArgument: boolean,
    endCheck?: EndCheck
) : Promise<boolean> => {

    const { options, stack } = state;
    let { tokens, cursor } = state;

    cursor = consumeWS(tokens, cursor);

    const startPosition = cursor;
    const operand : Token[] = [];

    let ws = '', wspos = 0;

    while (
        cursor < tokens.length &&
        tokens[cursor].value !== ']' &&
        tokens[cursor].value !== '&&' &&
        tokens[cursor].value !== '||' &&
        (!(asArgument && tokens[cursor].value === ','))
    ) {

        // consume whitespace
        if (isWS(tokens, cursor)) {
            if (ws === '') {
                wspos = tokens[cursor].position;
            }
            ws += tokens[cursor].value;
            cursor += 1;
            continue;
        }

        // non literal-text token
        const mockState : ITokenizeState = {
            options: { ...options },
            stack: [ ...stack ],
            tokens: [ ...tokens ],
            cursor
        }
        if (
            await tokenizeEscape(mockState, ['"', '$', '\\', ',', ']',]) ||
            await tokenizeEscapeBlock(mockState) ||
            await tokenizeQuoted(mockState) ||
            await tokenizeSpecial(mockState) ||
            await tokenizeIf(mockState) ||
            await tokenizeFunction(mockState)
        ) {
            const last = operand[operand.length - 1];
            const token = <Token>mockState.output;

            if (!last) {
                operand.push(<Token>mockState.output);

            } else if (last.type === TokenType.TEXT) {
                last.value += ws;
                if (token.type === TokenType.TEXT) {
                    last.value += <string>token.value;
                } else {
                    operand.push(token);
                }

            } else if (token.type === TokenType.TEXT) {
                token.position = wspos;
                token.value = ws + token.value;
                operand.push(token);

            } else {
                operand.push(new TextToken({
                    position: wspos,
                    value: ws
                }));
                operand.push(token);
            }

            ws = '';
            wspos = 0;

            tokens = mockState.tokens;
            cursor = mockState.cursor;

            continue;
        }

        if (endCheck) {
            const checkState : IOperandState = {
                options: { ...options },
                stack: [ ...stack ],
                tokens: [ ...tokens ],
                operand: {
                    tokens: operand,
                    leadingWhitespace: ws !== ''
                },
                cursor
            };
            if (await endCheck(checkState, asArgument)) {
                tokens = checkState.tokens;
                cursor = checkState.cursor;
                if (checkState.endOfOperand) {
                    break;
                }
            }
        }

        // plain text token
        if (!operand.length) {
            operand.push(new TextToken(tokens[cursor]));

        } else if (operand[operand.length - 1].type === TokenType.TEXT) {
            operand[operand.length - 1].value += ws + tokens[cursor].value;

        } else {
            operand.push(new TextToken({
                position: ws !== '' ? wspos : tokens[cursor].position,
                value: tokens[cursor].value
            }));
        }

        ws = '';
        wspos = 0;
        cursor += 1;
    }

    if (!operand.length) {
        return false;
    }

    state.tokens = tokens;
    state.cursor = cursor;
    state.output = new TokenList({
        position: startPosition,
        value: operand
    });

    return true;
}