import ParserOptions from '../types/options';
import type { TokenizeState } from './tokenize';
import TextToken from '../tokens/text';
import TokenType from '../types/token-types';
import has from '../helpers/has';

export default (
    options: ParserOptions,
    state: TokenizeState
) : boolean => {
    if (!options.specialSequences) {
        return false;
    }

    let { tokens, cursor, output } = state;

    const characters = {
        'n': '\n',
        'r': '\r',
        't': '\t'
    }

    let value = tokens[cursor].value;
    if (
        value[0] !== '\\' ||
        (value[1] == null || value[1] === '') ||
        !has(characters, value[1])
    ) {
        return false;
    }

    value = characters[value[1]];
    if (output.length > 0 && output[output.length -1].type === TokenType.TEXT) {
        output[output.length - 1].value += value;

    } else {
        output.push(new TextToken({
            ...(tokens[cursor]),
            value
        }));
    }

    state.cursor = cursor + 1;
    return true;
}