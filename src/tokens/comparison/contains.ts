import type ParserOptions from '../../types/options';
import { type default as Manifest, ArgumentQuantifier } from '../../types/manifest-comparison';

import ComparisonToken, { IComparisonToken } from './base';

export const manifest : Manifest = {
    arguments: ArgumentQuantifier.RIGHTREQUIRED,
    description: "Checks if the left operand contains the right operand",
    casing: true,
    alias: ['contains'],
    inverse: {
        description: "Checks if operands are not loosely equal",
        alias: ['!contains']
    }
};

export interface IContainsToken extends IComparisonToken {
    caseSensitive: void | boolean;
}

export default class ContainsToken extends ComparisonToken {
    private caseSensitive: void | boolean;

    constructor(token: IContainsToken) {
        super({
            ...token,
            value: 'contains'
        });
        this.caseSensitive = token.caseSensitive;
    }

    async handle(options: ParserOptions, meta: unknown): Promise<boolean> {
        if (this.right == null) {
            // TODO - custom error
            throw new Error('TODO');
        }

        const v1 = await this.left.evaluate(options, meta);
        const v2 = await this.right.evaluate(options, meta);

        if (options.verifyOnly) {
            return false;
        }

        if (typeof v1 === 'string') {
            if (typeof v2 !== 'string') {
                return false;
            }
            if (this.caseSensitive) {
                return v1.includes(v2);
            }
            return v1.toLowerCase().includes(v2.toLowerCase())
        }

        if (!Array.isArray(v1)) {
            return false;
        }

        return v1.some((value: unknown) => {
            if (typeof value === 'string') {
                if (typeof v2 !== 'string') {
                    return false;
                }
                if (this.caseSensitive) {
                    return value === v2;
                }
                return value.toLowerCase() === v2.toLowerCase();
            }
            return v1 === v2;
        });
    }
}