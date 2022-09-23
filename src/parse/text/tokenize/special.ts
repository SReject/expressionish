import has from '../../../helpers/has';

import type ITokenizeState from '../../../types/tokenize-state';

import TextToken from '../token';

export default async (state: ITokenizeState) : Promise<boolean> => {
    if (!state.options.specialSequences) {
        return false;
    }

    const characters : Record<string, string> = {
        'n': '\n',
        'r': '\r',
        't': '\t'
    };

    const { tokens, cursor } = state;
    if (
        tokens[cursor]?.value !== '\\' ||
        tokens[cursor + 1] == null ||
        !has(characters, tokens[cursor + 1].value)
    ) {
        return false;
    }

    state.output = new TextToken({
        position: tokens[cursor].position,
        value: tokens[cursor + 1].value
    });
    state.cursor += 2;

    return true;
}