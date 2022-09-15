import type { TokenizeState } from './tokenize';
import TextToken from '../tokens/text';
import TokenType from '../types/token-types';

export default (
    state: TokenizeState,
    characters?: string[]
) : boolean => {
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
        position: cursor,
        value: tokens[cursor + 1].value
    });
    state.cursor += 2;
    return true;
}