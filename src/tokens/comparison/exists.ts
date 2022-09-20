import type ParserOptions from '../../types/options';
import { type default as Manifest, ArgumentQuantifier } from '../../types/manifest-comparison';

import ComparisonToken, { IComparisonToken } from './base';

export const manifest : Manifest = {
    arguments: ArgumentQuantifier.LEFTONLY,
    description: "Checks if operand is not null, false or empty string",
    alias: ['exists'],
    inverse: {
        description: "Checks if operand is null, false or empty string",
        alias: ['!exists']
    }
};

export default class ExistsToken extends ComparisonToken {
    constructor(token: IComparisonToken) {
        super({
            ...token,
            value: 'exists'
        });
    }

    async handle(options: ParserOptions, meta: unknown): Promise<boolean> {
        const v1 = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        return v1 != null && v1 !== '';
    }
}