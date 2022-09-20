import type ParserOptions from '../../types/options';
import { type default as Manifest, ArgumentQuantifier } from '../../types/manifest-comparison';

import ComparisonToken, { IComparisonToken } from './base';

export interface IIsToken extends IComparisonToken {
    against: null | boolean;
}

export const manifest : Manifest = {
    arguments: ArgumentQuantifier.LEFTONLY,
    description: "Checks if the left operand is boolean",
    alias: ['isbool'],
    inverse: {
        description: "Checks if the left operand is not a boolean",
        alias: ['!isbool']
    }
};


export default class IsToken extends ComparisonToken {
    public against : null | boolean;

    constructor(token: IIsToken) {
        super({
            ...token,
            value: 'isbool'
        });

        this.against = token.against;
    }

    async handle(options: ParserOptions, meta: unknown): Promise<boolean> {
        const v1 = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        return v1 === this.against;
    }

    toToken(): object {
        return {
            ...(super.toToken()),
            against: this.against
        }
    }
}