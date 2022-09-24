import has from '../../../helpers/has';

import type ITokenizeState from '../../../types/tokenize-state';

import TextToken from '../token';

export default async (state: ITokenizeState) : Promise<boolean> => {
    if (state.options.specialSequences === false) {
        return false;
    }

    const characters : Record<string, string> = {
        'n': '\n',
        'r': '\r',
        't': '\t'
    };

    const { tokens, cursor } = state;
    if (
        (cursor + 1) >= tokens.length ||
        tokens[cursor].value !== '\\' ||
        !has(characters, tokens[cursor + 1].value)
    ) {
        return false;
    }

    state.output = new TextToken({
        position: tokens[cursor].position,
        value: characters[tokens[cursor + 1].value]
    });
    state.cursor += 2;

    return true;
}