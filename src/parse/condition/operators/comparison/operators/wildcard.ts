import { type IOperator, type IHandleState, ArgumentsQuantifier } from '../../token';
import { type default as IParseOptions } from '../../../../../types/options';
import split from '../../../../../helpers/unicode-safe-split';
import toText from '../../../../../helpers/to-text';

const toRegExp = (subject: string, caseSensitive: boolean) : RegExp => {
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
    );
};

export default <IOperator>{
    name: 'wildcard',
    arguments: ArgumentsQuantifier.RIGHTREQUIRED,
    description: "Checks if the left operand is a match of the right operand wildcard",
    alias: ['iswm'],
    cased: true,
    inverse: {
        description: "Checks if the left operand is not a match of the right operand wildcard",
        alias: ['!iswm']
    },
    handle: async function (options: IParseOptions, meta: unknown, state: IHandleState) : Promise<boolean | undefined> {
        const { left, right, caseSensitive = false } = state;

        const leftText = toText(left);
        if (leftText == null) {
            return;
        }

        const rightText = toText(right);
        if (rightText == null) {
            return;
        }

        const v2RegExp = toRegExp(<string>rightText, caseSensitive);
        if (v2RegExp == null) {
            return;
        }

        return v2RegExp.test(<string>leftText);
    }
}