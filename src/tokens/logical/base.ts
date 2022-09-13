import TokenType from '../../types/token-types';

import { default as OperatorToken, IOperatorToken} from '../operator';

export interface ILogicalToken extends IOperatorToken {
}

export default class LogicalToken extends OperatorToken {
    constructor(token: ILogicalToken) {
        super({
            type: TokenType.LOGICAL,
            ...token
        });
    }
}