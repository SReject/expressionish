import ParserOptions from '../types/options';
import has from '../helpers/has';
import type { TokenizeState } from './tokenize';
import type Token from '../tokens/base';
import FunctionalToken from '../tokens/functional';
import tokenizeArgumentList from './argument-list';

const nameCheck = /^([a-z][a-z\d]{2,})$/i;

export default (
    options: ParserOptions,
    meta: any,
    state: TokenizeState
) : boolean => {

    let { tokens, cursor, output } = state;

    if (
        cursor + 4 >= tokens.length ||
        tokens[cursor].value !== '$'
    ) {
        return false;
    }

    const varPosition = tokens[cursor].position;

    cursor += 1;

    let prefix = '$';
    if (has(options.functionalHandlers, '$' + tokens[cursor].value[0])) {

        let {position, value} = tokens[cursor].value;
        prefix += value[0];

        if (value.length > 1) {
            tokens = tokens.slice();
            tokens[cursor] = {
                position,
                value: value[0]
            };

            tokens.splice(cursor + 1, 0, {
                position: position += 1,
                value: (<string>value).slice(1)
            });
            cursor += 1;
        }
        cursor += 1;
    }

    if (!nameCheck.test(tokens[cursor].value)) {
        return false;
    }

    const varName = tokens[cursor].value;
    cursor += 1;

    const varArguments : Token[] = [];
    const mockState = {
        tokens,
        cursor,
        output: varArguments
    }

    if (tokenizeArgumentList(options, meta, mockState)) {
        tokens = mockState.tokens;
        cursor = mockState.cursor;
    }

    output.push(new FunctionalToken({
        position: varPosition,
        prefix,
        value: varName,
        arguments: varArguments
    }));

    state.tokens = tokens;
    state.cursor = cursor;

    return true;
};