import has from '../helpers/has';

import {
    type IFunctionLookup
} from '../types/options';

import type ITokenizeState from '../types/tokenize-state';

import type Token from '../tokens/token';
import FunctionalToken from '../tokens/token-function';

import tokenizeArgumentList from './argument-list';

const nameCheck = /^([a-z][a-z\d]{2,})$/i;

export default async (state: ITokenizeState) : Promise<boolean> => {

    let { tokens, cursor, stack, options } = state;
    if (tokens[cursor]?.value !== '$' || tokens[cursor + 1] == null) {
        return false;
    }
    const position = tokens[cursor].position;

    cursor += 1;

    let prefix = '$',
        varname : string = tokens[cursor].value.toLowerCase(),
        lookupFn : IFunctionLookup;

    cursor += 1;

    if (has(options.functionHandlers, varname)) {
        const handler = options.functionHandlers[varname];
        lookupFn = () => handler;

    } else if (
        cursor >= tokens.length &&
        has(options.functionLookups, varname)
    ) {
        lookupFn = options.functionLookups[varname]
        prefix += varname;
        varname = tokens[cursor].value.toLowerCase();
        cursor += 1;

    } else {
        return false;
    }

    const mockState : ITokenizeState = {
        options: { ...options },
        tokens,
        cursor,
        stack: [ ...stack, `${prefix}${varname}`]
    }

    await tokenizeArgumentList(mockState);

    state.tokens = mockState.tokens;
    state.output = new FunctionalToken({
        position,
        prefix,
        value: varname,
        arguments: <Token[]>(mockState.output || []),
        lookupFn: lookupFn
    });
    state.cursor = mockState.cursor;

    return true;
};