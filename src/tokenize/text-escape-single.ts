import TextToken from '../tokens/token-text';

import type { TokenizeState } from './tokenize';

export default async (state: TokenizeState, characters?: string[]) : Promise<boolean> => {
    let { tokens, cursor } = state;

    if (characters == null) {
        characters = ['\\', '$', '"', '`']
    }

    if (
        tokens[cursor]?.value !== '\\' ||
        tokens[cursor + 1] == null ||
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