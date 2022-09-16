import type ParserOptions from '../types/options';

import has from '../helpers/has';

import TextToken from '../tokens/token-text';

import type { TokenizeState } from './tokenize';

export default async (options: ParserOptions, state: TokenizeState) : Promise<boolean> => {
    if (!options.specialSequences) {
        return false;
    }

    const characters : Record<string, string> = {
        'n': '\n',
        'r': '\r',
        't': '\t'
    };

    let { tokens, cursor } = state;
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