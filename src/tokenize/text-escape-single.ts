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

    const value = tokens[cursor].value;

    if (
        value[0] !== '\\' ||
        (value[1] == null || value[1] === '') ||
        characters.findIndex(value[1]) !== -1
    ) {
        return false;
    }

    state.output = new TextToken({
        position: cursor,
        value: value[1]
    });
    state.cursor = cursor + 1;
    return true;
}