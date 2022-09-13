import type { TokenizeState } from './tokenize';

import TextToken from '../tokens/text';
import TokenType from '../types/token-types';

export default (
    state: TokenizeState,
    characters?: string[]
) : boolean => {
    let { tokens, cursor, output } = state;

    if (characters == null) {
        characters = ['\\', '$', '"', '`']
    }

    if (
        tokens[cursor].value !== '\\' ||
        (cursor += 1) === tokens.length ||
        characters?.findIndex(tokens[cursor].value) === -1
    ) {
        return false;
    }

    if (output.length > 0 && output[output.length -1].type === TokenType.TEXT) {
        output[output.length - 1].value += tokens[cursor].value;
        state.cursor = cursor + 1;
    } else {
        output.push(new TextToken(tokens[cursor]));
        state.cursor = cursor + 1;
    }

    return true;
}