type PreEvalFnc = (options: EvaluateOptions, ...args: unknown[]) => Promise<unknown>;

type EvaluateMetaData = Record<unknown, unknown>;

interface Variable {
    preeval?: PreEvalFnc;
    argsCheck?: (data: EvaluateMetaData, ...args: unknown[]) => Promise<void>;
    evaluate: (data: EvaluateMetaData, ...args: unknown[]) => Promise<unknown>;
}
type VariableMap = Map<string, Variable>;

type LookupFnc = (name: string) => LookupVariable;
type LookupMap = Map<string, LookupFnc>;

interface TokenizeOptions {
    lookups: LookupMap;
    variables: VariableMap;
    expression: string;
}

interface EvaluateOptions extends TokenizeOptions {
    onlyValidate?: boolean;
    preeval?: PreEvalFnc;
    metadata?: EvaluateMetaData;
}

interface GenericToken {
    position: number;
    value: string;
}

type TokenizeResult<T = unknown> = [success: false] | [success: true, updatedCursor: number, result: T];

