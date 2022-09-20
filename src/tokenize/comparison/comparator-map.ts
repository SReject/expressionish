import { ArgumentQuantifier, type default as Manifest } from '../../types/manifest-comparison';

import ComparisonToken from '../../tokens/comparison/base';
import { default as ContainsToken, manifest as containsManifest } from '../../tokens/comparison/contains';
import { default as EqualLooseToken, manifest as equalLooseManifest } from '../../tokens/comparison/equal-loose';
import { default as EqualStrictToken, manifest as equalStrictManifest } from '../../tokens/comparison/equal-strict';
import { default as ExistsToken, manifest as existsManifest } from '../../tokens/comparison/exists';
import { default as GreaterThanEqualToken, manifest as greaterThanEqualManifest } from '../../tokens/comparison/greater-than-equal';
import { default as GreaterThanToken, manifest as greaterThanManifest } from '../../tokens/comparison/greater-than';
import { default as IsBoolToken, manifest as isBoolManifest } from '../../tokens/comparison/isbool';
import { default as IsNullToken, manifest as isNullManifest } from '../../tokens/comparison/isnull';
import { default as LessThanEqualToken, manifest as lessThanEqualManifest } from '../../tokens/comparison/less-than-equal';
import { default as LessThanToken, manifest as lessThanManifest } from '../../tokens/comparison/less-than';
import { default as NumericalToken, manifest as numericalManifest } from '../../tokens/comparison/numerical';
import { default as RegexToken, manifest as regexManifest } from '../../tokens/comparison/regex';
import { default as WildcardToken, manifest as wildcardManifest } from '../../tokens/comparison/wildcard';

interface Type<T = unknown> extends Function {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
}

interface ITokenBase {
    invert?: boolean;
    caseSensitive?: void | boolean;
}

export interface IComparator {
    tokenClass: Type<ComparisonToken>;
    arguments: ArgumentQuantifier;
    description: string;
    tokenBase?: ITokenBase;
}

const comparatorMap : Map<string, IComparator> = new Map();

((...args: Array<[Type<ComparisonToken>, Manifest]>) => {
    args.forEach((arg) => {

        const [TokenClass, manifest] = arg;

        manifest.alias.forEach(alias => {
            alias = alias.toLowerCase();

            comparatorMap.set(
                alias,
                {
                    description: manifest.description,
                    arguments: manifest.arguments,
                    tokenClass: TokenClass,
                    tokenBase: { invert: false }
                }
            );

            if (manifest.casing) {
                comparatorMap.set(
                    alias + 'cs',
                    {
                        description: manifest.description,
                        arguments: manifest.arguments,
                        tokenClass: TokenClass,
                        tokenBase: { invert: false, caseSensitive: true }
                    }
                );
            }
        });

        if (manifest.inverse !== false) {
            const { alias, description } = manifest.inverse;

            alias.forEach(alias => {
                alias = alias.toLowerCase();
                comparatorMap.set(
                    alias,
                    {
                        description: description,
                        arguments: manifest.arguments,
                        tokenClass: TokenClass,
                        tokenBase: { invert: true }
                    }
                );

                if (manifest.casing) {
                    comparatorMap.set(
                        alias + 'cs',
                        {
                            description: description,
                            arguments: manifest.arguments,
                            tokenClass: TokenClass,
                            tokenBase: { invert: false, caseSensitive: true }
                        }
                    );
                }
            });
        }
    });
})(
    [ContainsToken, containsManifest],
    [EqualLooseToken, equalLooseManifest],
    [EqualStrictToken, equalStrictManifest],
    [ExistsToken, existsManifest],
    [GreaterThanEqualToken, greaterThanEqualManifest],
    [GreaterThanToken, greaterThanManifest],
    [IsBoolToken, isBoolManifest],
    [IsNullToken, isNullManifest],
    [LessThanEqualToken, lessThanEqualManifest],
    [LessThanToken, lessThanManifest],
    [NumericalToken, numericalManifest],
    [RegexToken, regexManifest],
    [WildcardToken, wildcardManifest]
);

export default comparatorMap;