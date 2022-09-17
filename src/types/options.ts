export interface IFunctionHandler {
    stackCheck?: (stack: string[]) => Promise<boolean>;
    argsCheck?: (meta: any, ...args: any[]) => Promise<boolean>;
    evaluator: (meta: any, ...args: any[]) => Promise<any>;
}

export type IFunctionLookup = (name: string, stack?: string[], meta?: any) => IFunctionHandler;

export default interface ParserOptions {
    functionHandlers?: Record<string, IFunctionHandler>;
    functionLookups?: Record<string, IFunctionLookup>;

    eol?: 'error' | 'remove' | 'space' | 'keep';
    specialSequences?: boolean;

    verifyOnly?: boolean;
    skipArgumentsCheck?: boolean;
}