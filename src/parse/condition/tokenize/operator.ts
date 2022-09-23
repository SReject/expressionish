import type ITokenizeState from '../../../types/tokenize-state';

import { consume as consumeWS, is as isWS } from '../../../helpers/whitespace';

import { comparisonOperators, type IOperator } from '../operators';

export interface IOperatorState extends Omit<ITokenizeState, "output"> {
    output?: IOperator
}

export default async (state: IOperatorState, asArgument = true) : Promise<boolean> => {

    const { tokens } = state;
    let { cursor } = state;

    if (cursor >= tokens.length) {
        return false;
    }

    let compname = '';

    if (tokens[cursor].value === '!') {
        compname += '!'
        cursor += 1;
        if (cursor >= tokens.length) {
            return false;
        }
    }

    if (/^[a-z]+$/i.test(tokens[cursor].value)) {
        compname += tokens[cursor].value;
        cursor += 1;

    } else {
        while (
            cursor < tokens.length &&
            (
                tokens[cursor].value === '=' ||
                tokens[cursor].value === '<' ||
                tokens[cursor].value === '>'
            )
        ) {
            compname + tokens[cursor].value;
            cursor += 1;
        }
    }

    if (
        compname !== '' &&
        comparisonOperators.has(compname) &&
        (
            cursor >= tokens.length ||
            tokens[cursor].value === ']' ||
            (asArgument && tokens[cursor].value === ',') ||
            isWS(tokens, cursor)
        )
    ) {

        state.cursor = consumeWS(tokens, cursor);
        state.output = <IOperator>comparisonOperators.get(compname);
        return true;
    }

    return false;
};