import type { IBaseToken } from '../tokens/base';

export default (tokens: IBaseToken[]) : string => {
    let result = '';
    while (tokens.length && tokens[0].value === ' ') {
        result += (<IBaseToken>tokens.shift()).value;
    }
    return result;
};