import split from '../../helpers/unicode-safe-split';
import toText from '../../helpers/to-text';

import ParserOptions from '../../types/options';
import { type default as Manifest, ArgumentQuantifier } from '../../types/manifest-comparison';

import ComparisonToken, { IComparisonToken } from './base';

const toRegExp = (subject: string, caseSensitive = false) : RegExp => {
    const wc = split(subject);
    let pattern = '';
    let anchorStart = true;
    let anchorEnd = true;
    let idx = 0;
    const len = wc.length;
    while (idx < len) {

        const atStart = idx === 0;

        let hasTokens = false;
        let zeroOrMore = false;
        let anyOneChar = 0;

        let char = wc[idx];
        while (char === '?' || char === '*') {
            hasTokens = true;
            if (wc[idx] === '?') {
                anyOneChar += 1;
            } else {
                zeroOrMore = true;
            }
            idx += 1;
            char = wc[idx];
        }

        if (hasTokens) {
            pattern += '.'.repeat(anyOneChar);
            if (zeroOrMore) {
                const atEnd = idx === len;

                if (atStart) {
                    anchorStart = false;
                }
                if (atEnd) {
                    anchorEnd = false;
                }

                if (!atStart && !atEnd) {
                    if (!anyOneChar) {
                        pattern += '.*';
                    } else {
                        pattern += '+';
                    }
                }
            }
            continue;
        }

        // Char needs to be escaped
        if (
            char === '^' ||
            char === '.' ||
            char === '-' ||
            char === '+' ||
            char === '\\' ||
            char === '/' ||
            char === '|' ||
            char === '(' ||
            char === ')' ||
            char === '[' ||
            char === ']' ||
            char === '{' ||
            char === '}' ||
            char === '$'
        ) {
            pattern += `\\${char}`;
            idx += 1;
            continue;
        }

        pattern += char;
        idx += 1;
    }

    if (anchorStart) {
        pattern = '^' + pattern;
    }
    if (anchorEnd) {
        pattern += '$';
    }
    return new RegExp(
        pattern,
        'u' + (!caseSensitive ? 'i' : '')
    )
};

interface IWildcardToken extends IComparisonToken {
    caseSensitive: boolean;
}

export const manifest : Manifest = {
    arguments: ArgumentQuantifier.RIGHTREQUIRED,
    description: "Checks if the left operand is a match of the right operand wildcard",
    alias: ['iswm'],
    casing: true,
    inverse: {
        description: "Checks if the left operand is not a match of the right operand wildcard",
        alias: ['!iswm']
    }
};

export default class WildcardToken extends ComparisonToken {
    readonly caseSensitive: boolean

    constructor(token: IWildcardToken) {
        super({
            ...token,
            value: 'wildcard'
        });
    }

    async handle(options: ParserOptions, meta: unknown): Promise<boolean> {
        if (this.right == null) {
            // TODO - custom error
            throw new Error('TODO - Evaluation Error: Right hand argument missing');
        }

        const v1 = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            await this.right.evaluate(options, meta);
            return false;
        }

        const v1Text = toText(v1);
        if (v1Text == null) {
            return false;
        }

        const v2 = await this.right.evaluate(options, meta);
        const v2Text = toText(v2);
        if (v2Text == null) {
            return false;
        }

        const v2RegExp = toRegExp(v2Text);
        if (v2RegExp == null) {
            return false;
        }

        return v2RegExp.test(v1Text);
    }

    async handleInverse(options: ParserOptions, meta: unknown): Promise<boolean> {

        if (this.right == null) {
            // TODO - custom error
            throw new Error('TODO - Evaluation Error: Right hand argument missing');
        }

        const v1 = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            await this.right.evaluate(options, meta);
            return false;
        }

        const v1Text = toText(v1);
        if (v1Text == null) {
            return false;
        }

        const v2 = await this.right.evaluate(options, meta);
        const v2Text = toText(v2);
        if (v2Text == null) {
            return false;
        }

        const v2RegExp = toRegExp(v2Text);
        if (v2RegExp == null) {
            return false;
        }

        return !v2RegExp.test(v1Text);
    }

    toToken() : object {
        return {
            ...(super.toToken()),
            caseSensitive: this.caseSensitive
        };
    }
}