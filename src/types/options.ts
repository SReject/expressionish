interface Handler {
    argsCheck?: (meta: any, ...args: any[]) => any;
    evaluator: (meta: any, ...args: any[]) => any;
}

type LookupHandler = (meta: any, name: string) => Handler;

export interface ParserOptions {
    functionalHandlers: Record<string, LookupHandler>;
    verifyOnly?: boolean;
    skipArgumentsCheck?: boolean;
};