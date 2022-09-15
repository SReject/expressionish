import ParserOptions from '../types/options';
import type { TokenizeState } from './tokenize';
import TextToken from '../tokens/text';
import has from '../helpers/has';

export default (
    options: ParserOptions,
    state: TokenizeState
) : boolean => {
    if (!options.specialSequences) {
        return false;
    }

    let { tokens, cursor } = state;

    const characters : Record<string, string> = {
        'n': '\n',
        'r': '\r',
        't': '\t'
    }
    if (
        tokens[cursor] == null ||
        tokens[cursor].value !== '\\' ||
        tokens[cursor + 1] == null ||
        !has(characters, tokens[cursor + 1].value)
    ) {
        return false;
    }

    state.output = new TextToken({
        position: state.cursor,
        value: tokens[cursor + 1].value
    });
    state.cursor += 2;

    return true;
}