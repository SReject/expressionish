import type ParserOptions from '../../types/options';
import { type default as Manifest, ArgumentQuantifier } from '../../types/manifest-comparison';

import ComparisonToken, { IComparisonToken } from './base';

export const manifest : Manifest = {
    arguments: ArgumentQuantifier.RIGHTREQUIRED,
    description: "Checks if operands are strictly equal",
    alias: ['==='],
    inverse: {
        description: "Checks if operands are not strictly equal",
        alias: ['!==']
    }
};

export default class EqualStrictToken extends ComparisonToken {
    constructor(token: IComparisonToken) {
        super({
            ...token,
            value: 'equal'
        });
    }

    async handle(options: ParserOptions, meta: unknown): Promise<boolean> {
        if (this.right == null) {
            // TODO - custom error
            throw new Error('TODO - Evaluation Error: Right hand argument missing');
        }

        const v1 = await this.left.evaluate(options, meta);
        const v2 = await this.right.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        return (
            v1 === v2 ||
            (v1 == null && v2 == null) ||
            (Number.isNaN(v1) && Number.isNaN(v2))
        );
    }
}