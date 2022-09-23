import type IPreToken from '../types/pre-token';

export const is = (tokens: IPreToken[], cursor: number) : boolean => {
    return (
        cursor < tokens.length &&
        (
            tokens[cursor].value === ' ' ||
            tokens[cursor].value === '\t' ||
            tokens[cursor].value === '\r' ||
            tokens[cursor].value === '\n'
        )
    );
};

export const consume = (tokens: IPreToken[], cursor: number) : number => {
    while (is(tokens, cursor)) {
        cursor += 1;
    }

    return cursor;
}