import TokenType from '../types/token-types';
import ParserOptions from '../types/options';
import { default as Token, IToken } from './base';
import type { default as TokenList } from './token-list';

export interface IFunctionalToken extends IToken {
    prefix: string;
    arguments: TokenList
}

export default class FunctionalToken extends Token {
    protected prefix: string;
    protected value: string;
    protected arguments: TokenList;

    constructor(token: IFunctionalToken) {
        super({
            ...token,
            type: TokenType.FUNCTIONAL
        });
        this.prefix = token.prefix;
        this.arguments = token.arguments;
    }

    async evaluate(options: ParserOptions, meta: any = {}) : Promise<any> {
        const lookupHandler = options.functionalHandlers[this.prefix];

        if (lookupHandler == null) {
            // TODO: custom errors
            throw new Error('TODO');
        }
        const handler = lookupHandler(meta, this.value);

        if (handler == null) {
            // TODO: custom errors
            throw new Error('TODO');
        }

        let args : any[] = [];
        if (this.arguments != null) {
            const argList = this.arguments.value;
            for (let idx = 0; idx < argList.length; idx += 1) {
                const arg = await argList[idx].evaluate(options, meta);
                args.push(arg);
            }
        }

        if (options.verifyOnly) {
            return;
        }

        if (!options.skipArgumentsCheck && handler.argsCheck != null) {
            try {
                await handler.argsCheck(meta, args);
            } catch (err) {
                // TODO - Custom errors
                throw err;
            }
        }

        try {
            const res = handler.evaluator(meta, ...args);
            return res;

        } catch (err) {
            // TODO: custom errors
            throw err;
        }
    }

    toToken() : object {
        return {
            ...(super.toToken()),
            prefix: this.prefix,
            arguments: this.arguments.toToken()
        }
    }
}