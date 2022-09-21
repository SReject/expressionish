import TokenType from '../../types/token-types';

import { default as OperatorToken, IOperatorToken} from '../token-operator';

export interface ILogicalToken extends Omit<IOperatorToken, "type"> {
    value: unknown;
}

export default class LogicalToken extends OperatorToken {
    constructor(token: ILogicalToken) {
        super({
            ...token,
            type: TokenType.LOGICAL
        });
    }
}