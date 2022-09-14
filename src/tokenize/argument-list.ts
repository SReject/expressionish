import ParserOptions from '../types/options';
import { TokenizeState } from "./tokenize";
import Token from '../tokens/base';
import TokenList from '../tokens/token-list';
import tokenizeArgument from './argument';

export default (options: ParserOptions, meta: any, state: TokenizeState) : boolean => {

    let { tokens, cursor } = state;

    if (tokens[cursor].value !== '[') {
        return false;
    }
    cursor += 1;

    let args : TokenList[] = [];

    while (
        cursor < tokens.length &&
        tokens[cursor].value != ']'
    ) {

        // consume leading whitespace
        while (tokens[cursor].value === ' ') {
            cursor += 1;
        }

        let argParts : Token[] = [];
        const mockState = {
            tokens,
            cursor,
            output: argParts
        };

        tokenizeArgument(options, meta, mockState);

        const next = mockState.tokens[mockState.cursor].value;
        if (next == null) {
            // TODO - custom error - Syntax Error: unexpected end
            throw new Error('TODO - Syntax Error: Unexpected end');
        }

        if (
            next !== ',' &&
            next !== ']'
        ) {
            // TODO - custom error - Syntax Error: Illegal token
            throw new Error('TODO - Syntax Error: Illegal Token')
        }

        args.push(new TokenList({
            position: cursor,
            value: argParts
        }));
        tokens = mockState.tokens;
        cursor = mockState.cursor;


        if (next === ',') {
            cursor += 1;
        }
    }

    if (tokens[cursor].value !== ']') {
        // TODO - custom error - SyntaxError: Expected ']'
        throw new Error('TODO - Syntax Error: Expected \']\'');
    }

    state.tokens = tokens;
    state.cursor = cursor + 1;
    state.output.push(...args);

    return true;
};