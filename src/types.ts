export type PreEvalFnc = (options: EvaluateOptions, ...args: unknown[]) => Promise<unknown>;

export type EvaluateMetaData = Record<string | number | symbol, unknown>;

export interface Variable {
    preeval?: PreEvalFnc;
    argsCheck?: (data: EvaluateMetaData, ...args: unknown[]) => Promise<void>;
    evaluate: (data: EvaluateMetaData, ...args: unknown[]) => Promise<unknown>;
}
export type VariableMap = Map<string, Variable>;

export type LookupFnc = (name: string) => Variable;
export type LookupMap = Map<string, LookupFnc>;

export interface TokenizeOptions {
    lookups: LookupMap;
    variables: VariableMap;
    expression: string;
}

export interface EvaluateOptions extends TokenizeOptions {
    onlyValidate?: boolean;
    preeval?: PreEvalFnc;
    metadata?: EvaluateMetaData;
}

export interface GenericToken {
    position: number;
    value: string;
}

export type TokenizeResult<T = unknown> = [success: false] | [success: true, updatedCursor: number, result: T];