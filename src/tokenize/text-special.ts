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

    let value : string = tokens[cursor].value;
    if (
        value[0] !== '\\' ||
        (value[1] == null || value[1] === '') ||
        !has(characters, value[1])
    ) {
        return false;
    }

    state.output = new TextToken({
        position: state.cursor,
        value: characters[value[1]]
    });
    state.cursor += 1;

    return true;
}