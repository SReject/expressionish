import type ITokenizeState from '../../../types/tokenize-state';

import TextToken from '../token';

export default async (state: ITokenizeState, characters?: string[]) : Promise<boolean> => {
    const { tokens, cursor } = state;

    if (characters == null) {
        characters = ['\\', '$', '"', '`']
    }

    if (
        (cursor + 1) >= tokens.length ||
        tokens[cursor].value !== '\\' ||
        !characters.includes(tokens[cursor + 1].value)
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