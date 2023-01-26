declare type RequireAtLeastOne<T> = { [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>; }[keyof T];

declare type IMeta = Record<string, unknown>;

declare enum OperatorQuantifier {
    LEFTONLY,
    RIGHTOPTIONAL,
    RIGHTREQUIRED,
    PREBLOCK,
    POSTBLOCK
}

declare enum TokenType {
    UNKNOWN,
    EMPTY,
    TEXT,
    LIST,
    FUNCTION,
    CONDITION
}