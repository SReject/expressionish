import has from '../../../helpers/has';

import { type IFunctionLookup, type IFunctionHandler } from '../../../types/options';

import type ITokenizeState from '../../../types/tokenize-state';

import type Token from '../../token';
import FunctionalToken from '../token';

import { tokenizeArgumentsList } from '../../argument-list';

export default async (state: ITokenizeState) : Promise<boolean> => {
    const { tokens, stack, options } = state;
    let cursor = state.cursor;

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
        const handler : IFunctionHandler = (<Record<string, IFunctionHandler>>options.functionHandlers)[varname];
        lookupFn = async () => handler;

    } else if (
        cursor >= tokens.length &&
        has(options.functionLookups, varname)
    ) {
        lookupFn = (<Record<string, IFunctionLookup>>options.functionLookups)[varname]
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

    await tokenizeArgumentsList(mockState);

    state.tokens = mockState.tokens;
    state.output = new FunctionalToken({
        position,
        prefix,
        value: varname,
        arguments: <Token[]>(mockState.output || []),
        lookupFn
    });
    state.cursor = mockState.cursor;

    return true;
};