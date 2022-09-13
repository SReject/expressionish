interface Handler {
    argsCheck?: (...args: any[]) => any;
    evaluator: (...args: any[]) => any;
}

type LookupHandler = (name: string) => Handler;

export interface ParserOptions {
    conditionalHandlers: Record<string, LookupHandler>
    functionalHandlers: Record<string, LookupHandler>;
    verifyOnly?: boolean;
    skipArgumentsCheck?: boolean;
};