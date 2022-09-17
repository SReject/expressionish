export interface IFunctionHandler {
    stackCheck?: (stack: string[]) => Promise<boolean>;
    argsCheck?: (meta: unknown, ...args: unknown[]) => Promise<boolean>;
    evaluator: (meta: unknown, ...args: unknown[]) => Promise<unknown>;
}

export type IFunctionLookup = (name: string, stack?: string[], meta?: unknown) => IFunctionHandler;

export default interface ParserOptions {
    functionHandlers?: Record<string, IFunctionHandler>;
    functionLookups?: Record<string, IFunctionLookup>;

    eol?: 'error' | 'remove' | 'space' | 'keep';
    specialSequences?: boolean;

    verifyOnly?: boolean;
    skipArgumentsCheck?: boolean;
}