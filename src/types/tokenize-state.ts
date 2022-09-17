import type ParserOptions from './options';
import type IPreToken from './pre-token';
import type Token from '../tokens/token';

export default interface ITokenizeState {
    options: ParserOptions,
    tokens: IPreToken[];
    cursor: number;
    stack: Array<string | number>;
    output?: Token | Token[];
}