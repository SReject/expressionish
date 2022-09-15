import has from '../helpers/has';

import type ParserOptions from '../types/options';

import type Token from '../tokens/token';
import FunctionalToken from '../tokens/token-function';

import tokenizeArgumentList from './argument-list';
import type { TokenizeState } from './tokenize';

const nameCheck = /^([a-z][a-z\d]{2,})$/i;

export default (
    options: ParserOptions,
    meta: any,
    state: TokenizeState
) : boolean => {

    let { tokens, cursor } = state;

    if (tokens[cursor]?.value !== '$' || tokens[cursor + 1] == null) {
        return false;
    }
    const position = tokens[cursor].position;

    let prefix = '$';
    cursor += 1;

    let varName = tokens[cursor].value;
    if (has(options.functionalHandlers,`$${varName}`)) {
        prefix += tokens[cursor].value;
        cursor += 1;

        if (cursor >= tokens.length) {
            return false;
        }

        varName = tokens[cursor].value;

    } else if ((cursor + 1) < tokens.length) {
        cursor += 1;
        varName += tokens[cursor].value;
    }
    cursor += 1;

    if (!nameCheck.test(varName)) {
        return false;
    }

    const lookupHandler = options.functionalHandlers[prefix];
    if (!lookupHandler?.(varName)) {
        return false;
    }

    const mockState : TokenizeState = {
        tokens,
        cursor
    }

    tokenizeArgumentList(options, meta, mockState);

    state.tokens = mockState.tokens;
    state.output = new FunctionalToken({
        position,
        prefix,
        value: varName,
        arguments: <Token[]>(mockState.output || [])
    });
    state.cursor = mockState.cursor;

    return true;
};