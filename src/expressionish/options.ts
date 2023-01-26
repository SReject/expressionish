export const enum OperatorQuantifier {
    LEFTONLY,
    RIGHTOPTIONAL,
    RIGHTREQUIRED,
    PREBLOCK,
    BLOCK
}

export type IMeta = Record<string, unknown>;

export type IHandleFnc<T> = (options: IEvaluateOptions, meta: IMeta, stack: string[], ...args: unknown[]) => Promise<T>;

export type IEOLQuantifier = 'keep' | 'remove' | 'space' | 'error';

export type IEndOfLine = IEOLQuantifier | ((eol: string) => string);

export interface IEOLDefinition {
    quantifier: IEOLQuantifier | 'transform';
    transform: (char: string) => string;
}

export interface IRealizedOperator {
    signifier: string;
    quantifier: OperatorQuantifier
    cased: boolean;
    defer: boolean;
    evaluate: IHandleFnc<boolean>
}

export interface IOperatorDefinition {
    signifier: string | string[];
    quantifier: OperatorQuantifier;
    cased?: boolean;
    defer?: boolean;
    inverse?: {
        signifier?: string | string[];
        evaluate?: IHandleFnc<boolean>;
    };
    evaluate: IHandleFnc<boolean>;
}

export interface IOptionsList<T> {
    disposition?: 'append' | 'replace';
    items: T;
}

export interface IFunctionHandler {
    defer?: boolean;
    stackCheck?: (options: IEvaluateOptions, meta: IMeta, stack: string[]) => Promise<void>;
    argsCheck?: IHandleFnc<void>;
    evaluate: IHandleFnc<unknown>;
}

export type ILookupHandler = (options: IExpressionOptions, meta: IMeta, stack: string[], name: string) => Promise<IFunctionHandler>;

export interface IGroupSignifier {
    open: string,
    delimiter?: string,
    close: string
}

export interface IQuoteQuantifier {
    open: string;
    close: string;
}

export interface IExpressionOptions {
    eol?: IEndOfLine;
    escapeSignifier?: string;
    functionSignifier?: string;
    groupSignifier?: 'parens' | 'brackets' | 'curly' | IGroupSignifier;
    quotes?: false | 'single' | 'double' | 'both' | IQuoteQuantifier | IQuoteQuantifier[];
    specialSequences?: boolean | IOptionsList<Record<string, string>>;
    comparisonOperators?: boolean | IOptionsList<IOperatorDefinition[]>;
    blockOperators?: boolean | IOptionsList<IOperatorDefinition[]>;
    functionHandlers?: boolean | IOptionsList<Record<string, IOperatorDefinition>>;
    lookupHandlers?: Record<string, ILookupHandler>;
}

export interface IEvaluateOptions {
    verifyOnly?: boolean;
    skipStackChecks?: boolean;
    skipArgumentsChecks?: boolean;
}

export interface IRealizedGroupSignifier {
    open: string,
    delimiter: string,
    close: string
}

export interface IRealizedOptions {
    eol: IEOLDefinition;
    escapeSignifier: string;
    functionSignifier: string;
    groupSignifier: IRealizedGroupSignifier;
    quotes: IQuoteQuantifier[];
    specialSequence: Record<string, string>;
    comparisonOperators: Record<string, IRealizedOperator>;
    blockOperators: Record<string, IRealizedOperator>;
    functionHandlers: Record<string, IFunctionHandler>;
    lookupHandler: Record<string, ILookupHandler>;
}