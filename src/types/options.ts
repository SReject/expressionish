export type IMeta = Record<string, unknown>;

export interface IFunctionHandler {
    /** When true argument evaluation will defer to handling functions */
    defer?: boolean;
    stackCheck?: (options: IEvaluateOptions, meta: IMeta, stack: string[]) => Promise<boolean>;
    argsCheck?: (options: IEvaluateOptions, meta: IMeta, ...args: unknown[]) => Promise<boolean>;
    evaluate: (options: IEvaluateOptions, meta: IMeta, ...args: unknown[]) => Promise<unknown>;
}

export type IFunctionLookup = (name: string, stack?: string[], meta?: unknown) => Promise<IFunctionHandler>;

export default interface IParserOptions {
    functionHandlers?: Record<string, IFunctionHandler>;
    functionLookups?: Record<string, IFunctionLookup>;

    "if"?: boolean;
    eol?: 'error' | 'remove' | 'space' | 'keep';
    specialSequences?: boolean;

    verifyOnly?: boolean;
    skipStackCheck?: boolean;
    skipArgumentsCheck?: boolean;

    stack?: string[];
}

export const enum OperatorQuantifier {
    LEFTONLY,
    RIGHTOPTIONAL,
    RIGHTREQUIRED,
    PREBLOCK,
    BLOCK
}

export type IOperatorEvaluate = (options: IExpressionOptions, meta: IMeta, ...args: unknown[]) => Promise<boolean>;

export interface IOperatorDefinition {
    signifier: string | string[];
    quantifier: OperatorQuantifier;
    cased?: boolean;
    defer?: boolean;
    inverse?: {
        signifier?: string | string[];
        evaluator?: IOperatorEvaluate;
    };
    evaluate: IOperatorEvaluate;
}

export interface IOperatorList {
    disposition?: 'append' | 'replace';
    operators: IOperatorDefinition[];
}

export type ILookupHandler = (options: IExpressionOptions, meta: IMeta, stack: string[], name: string) => Promise<IFunctionHandler>;

export interface IExpressionOptions {
    eol?: 'error' | 'remove' | 'space' | 'keep';
    specialSequences?: boolean | Record<string, string>;

    functionHandlers?: boolean | Record<string, IFunctionHandler>;
    lookupHandlers?: boolean | Record<string, ILookupHandler>;

    comparisonOperators?: boolean | IOperatorList;
    blockOperators?: boolean | IOperatorList;
}


export interface IEvaluateOptions {
    verifyOnly?: boolean;
    skipStackChecks?: boolean;
    skipArgumentsChecks?: boolean;
}