import ParserOptions from '../../types/options';
import split from '../../helpers/unicode-safe-split';
import toText from '../../helpers/to-text';
import ComparisonToken, { IComparisonToken } from './base';

const toRegExp = (subject: string, caseSensitive: boolean = false) : RegExp => {
    let wc = split(subject);
    let pattern = '';
    let anchorStart = true;
    let anchorEnd = true;
    let idx = 0;
    let len = wc.length;
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

export default class WildcardToken extends ComparisonToken {
    readonly caseSensitive: boolean

    constructor(token: IWildcardToken) {
        super({
            ...token,
            value: 'wildcard'
        });
        this.caseSensitive = token.caseSensitive;
    }

    async handle(options: ParserOptions, meta?: any): Promise<boolean> {
        if (this.right == null) {
            // TODO - custom error
            throw new Error('TODO - Evaluation Error: Right hand argument missing');
        }

        let v1 = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            await this.right.evaluate(options, meta);
            return false;
        }

        v1 = toText(v1);
        if (v1 == null) {
            return false;
        }

        let v2 = await this.right.evaluate(options, meta);
        v2 = toText(v2);
        if (v2 == null) {
            return false;
        }

        v2 = toRegExp(v2);
        if (v2 == null) {
            return false;
        }

        return v2.test(v1);
    }

    async handleInverse(options: ParserOptions, meta?: any): Promise<boolean> {

        if (this.right == null) {
            // TODO - custom error
            throw new Error('TODO - Evaluation Error: Right hand argument missing');
        }

        let v1 = await this.left.evaluate(options, meta);

        if (options.verifyOnly) {
            await this.right.evaluate(options, meta);
            return false;
        }

        v1 = toText(v1);
        if (v1 == null) {
            return false;
        }

        let v2 = await this.right.evaluate(options, meta);
        v2 = toRegExp(v2);
        if (v2 == null) {
            return false;
        }

        return !v2.test(v1);
    }

    toToken() : object {
        return {
            ...(super.toToken()),
            caseSensitive: this.caseSensitive
        };
    }
}