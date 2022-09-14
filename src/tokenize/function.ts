import ParserOptions from '../types/options';
import has from '../helpers/has';
import type { TokenizeState } from './tokenize';
import FunctionalToken from '../tokens/functional';
import tokenizeArgumentList from './argument-list';
import Token from '../tokens/base';

const nameCheck = /^([a-z][a-z\d]{2,})$/i;

export default (
    options: ParserOptions,
    meta: any,
    state: TokenizeState
) : boolean => {

    let { tokens, cursor } = state;

    if (
        tokens[cursor].value !== '$' ||
        cursor + 4 >= tokens.length
    ) {
        return false;
    }
    const startCursor = cursor;

    let prefix = '$';

    cursor += 1;

    if (has(options.functionalHandlers, '$' + tokens[cursor].value[0])) {

        let { position, value } = tokens[cursor];

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

    const mockState : TokenizeState = {
        tokens,
        cursor
    }

    tokenizeArgumentList(options, meta, mockState);

    state.tokens = mockState.tokens;
    state.output = new FunctionalToken({
        position: startCursor,
        prefix,
        value: varName,
        arguments: <Token[]>(mockState.output || [])
    });
    state.cursor = mockState.cursor;

    return true;
};