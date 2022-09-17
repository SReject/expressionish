import TokenType from '../types/token-types';
import ParserOptions, { type IFunctionLookup } from '../types/options';
import Token from './token';

export interface IFunctionalToken {
    position: number;
    prefix: string;
    value: string;
    arguments: Token[];
    lookupFn: IFunctionLookup;
}

export default class FunctionalToken extends Token {
    public prefix: string;
    public arguments: Token[];
    public lookupFn : IFunctionLookup;

    constructor(token: IFunctionalToken) {
        super({
            ...token,
            type: TokenType.FUNCTIONAL
        });
        this.prefix = token.prefix;
        this.arguments = token.arguments;
        this.lookupFn = token.lookupFn;
    }

    async evaluate(options: ParserOptions, meta: unknown) : Promise<unknown> {
        const handler = this.lookupFn(<string>this.value);
        if (handler == null) {
            // TODO: custom errors
            throw new Error(`TODO - No handler for ${this.prefix}${this.value}`);
        }

        const args : unknown[] = [];
        if (this.arguments != null) {
            const argList = this.arguments;
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
                throw new Error(`TODO - ArgumentsError: ${err.message}`);
            }
        }

        const res = handler.evaluator(meta, ...args);
        return res;
    }

    toToken() : object {
        return {
            ...(super.toToken()),
            prefix: this.prefix,
            arguments: this.arguments.map(value => value.toToken())
        }
    }
}