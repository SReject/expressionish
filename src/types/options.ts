interface Handler {
    argsCheck?: (meta: any, ...args: any[]) => any;
    evaluator: (meta: any, ...args: any[]) => any;
}

type LookupHandler = (name: string, meta?: any) => Handler | Promise<Handler>;

export default interface ParserOptions {
    functionalHandlers: Record<string, LookupHandler>;
    verifyOnly?: boolean;
    skipArgumentsCheck?: boolean;

    eol?: 'error' | 'remove' | 'space' | 'keep';
    specialSequences?: boolean;
};