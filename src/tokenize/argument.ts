import Token from '../tokens/base';
import ParserOptions from '../types/options';
import { TokenizeState } from './tokenize';

export default (options: ParserOptions, meta: any, state: TokenizeState) : boolean => {
    let { tokens, cursor, output } = state;

    let whitespace = '';
    let tokens : Token[] = []

    return false;
}