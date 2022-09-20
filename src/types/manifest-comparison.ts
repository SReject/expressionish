export const enum ArgumentQuantifier {
    LEFTONLY,
    RIGHTOPTIONAL,
    RIGHTREQUIRED
}

export default interface ComparatorManifest {
    arguments: ArgumentQuantifier;
    description: string;
    casing?: boolean;
    alias: string[];
    inverse: false | {description: string, alias: string[]}
}