import ParserOptions from '../types/options';

import has from '../helpers/has';

import type { TokenizeState } from './tokenize';

import TokenList from '../tokens/token-list';
import FunctionalToken from '../tokens/functional';

// import tokenizeArguments from './arguments;

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

    const varArguments : TokenList[] = [];
    const mockState = {
        tokens,
        cursor,
        output: varArguments
    }

    /* TODO - Uncomment once argument tokenizer is implemented
    if (tokenizeArguments(options, meta, mockState)) {
        tokens = mockState.tokens;
        cursor = mockState.cursor;
    }
    */

    output.push(new FunctionalToken({
        position: varPosition,
        prefix,
        value: varName,
        arguments: new TokenList({
            position: cursor,
            value: varArguments
        })
    }));

    state.tokens = tokens;
    state.cursor = cursor;

    return true;
};