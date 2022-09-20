import type ParserOptions from '../../types/options';
import { type default as Manifest, ArgumentQuantifier } from '../../types/manifest-comparison';

import ComparisonToken, { IComparisonToken } from './base';

export const manifest : Manifest = {
    arguments: ArgumentQuantifier.LEFTONLY,
    description: "Checks if the left operand is null or undefined",
    alias: ['isnull'],
    inverse: {
        description: "Checks if the left operand is not null or undefined",
        alias: ['!isnull']
    }
};


export default class IsNull extends ComparisonToken {
    constructor(token: IComparisonToken) {
        super({
            ...token,
            value: 'isnull'
        });
    }

    async handle(options: ParserOptions, meta: unknown): Promise<boolean> {
        const v1 = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        return v1 == null;
    }
}