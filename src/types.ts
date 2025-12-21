import type BaseToken from './parse/base-token';

/** Represents a small portion of an expression's text that may or may not have significance to the parser */
export interface GenericToken {

    /** The position of the generic token within the expression text */
    position: number;

    /** The character(s) comprising the token */
    value: string;
}

/** Data to be passed to variables when they are to be evaluated */
export type EvaluateData = Record<string | number | symbol, unknown>;

/** Function to call to validate a variable's arguments
 * @throws {import("./errors.ts").ExpressionArgumentsError} If an argument or the arguments list is invalid
*/
export type ArgsCheck = (
    /** meta data passed to the evaluate() call */
    data: EvaluateData,

    /** Arguments passed to the variable */
    ...args: unknown[]
) => undefined | Promise<never>;

/** Function to call just prior to evaluating a variable or looked up variable */
export type PreEval = (
    /** Options passed to the `<root>.evaluate()` function */
    data: EvaluateData,

    /** variable or lookup name */
    variable: Variable,
) => undefined | Promise<never>;

// #region Variable Map

/** Called to evaluate the variable */
export type VariableEvaluateFnc = (data: EvaluateData, ...args: unknown[]) => undefined | unknown | Promise<undefined | unknown>;

/** Represents a variable definition */
export interface Variable {

    /** Min arguments required by the variable */
    minArgumentsCount?: number;

    /** Max arguments required by the variable */
    maxArgumentsCount?: number;

    /** During evaluation of the expression, called prior to `argsCheck()` and `evaluate()` */
    preeval?: PreEval;

    /** During evaluation of the expression, called to validate arguments prior to calling `evaluate()` */
    argsCheck?: ArgsCheck;

    /** Function to call to handle evaluation of the variable */
    evaluate: VariableEvaluateFnc;
}


/** Represents a list of variables */
export interface VariableMap extends Map<string, Variable> {

    /** Checks if the given variable name is used as a key within the map */
    has(
        /** Variable name to check */
        name: string
    ) : boolean;

    /** Retrieves the variable definition associated with the specified name */
    get(
        /** Name of variable to retrieve */
        name: string
    ) : Variable;

    /** Stores a variable definition */
    set(
        /** Name to associate with the variable */
        name: string,

        /** Variable definition */
        definition: Variable
    ) : this;
}
// #endregion Variables

// #region Lookup Map

/** Handler to lookup `name`
 * @returns A variable declaration or undefined
*/
export type LookupFnc = (
    data: EvaluateData,

    /** The variable name to look up */
    name: string
) => undefined | Variable | Promise<undefined | Variable>;

/** Represents a Map of Lookup handlers */
export interface LookupMap extends Map<string, LookupFnc> {
    has(
        /** Variable prefix to check */
        prefix: string
    ) : boolean;

    get(
        /** Variable prefix to retrieve associated lookup handler */
        prefix: string
    ) : undefined | LookupFnc;

    /** Stores the lookup */
    set(
        /** Variable prefix to associated with the lookup handler */
        prefix: string,

        /** Handler function to perform the lookup */
        handler: LookupFnc
    ) : this;
}
// #endregion Variable-lookups

// #region Logic Operator Map

/** Performs a logic-operation on the given inputs
 * @returns The result of the operation
*/
export type LogicOperatorFnc = (data: EvaluateData, ...args: unknown[]) => boolean | Promise<boolean>;

/** Logic Operator Definition */
export interface LogicOperator {
    /** Min arguments required by the variable */
    minArgumentsCount?: number;

    /** Max arguments required by the variable */
    maxArgumentsCount?: number;

    /** During evaluation of the expression, called prior to `argsCheck()` and `evaluate()` */
    preeval?: PreEval;

    /** During evaluation of the expression, called to validate arguments prior to calling `evaluate()` */
    argsCheck?: ArgsCheck;

    /** Function to call to handle evaluation of the variable */
    evaluate: LogicOperatorFnc;
}

/** Represents a list of logic operators */
export interface LogicOperatorMap extends Map<string, LogicOperator> {

    /** Check if the operator is used as a key within the map */
    has(
        /** Operator to check */
        operator: string
    ) : boolean;

    /** Returns the logic operator definition associated with the specified operator */
    get(
        /** Operator of which to retrieve the definition */
        operator: string
    ) : undefined | LogicOperator;

    /** Stores the given operator definition */
    set(
        /** Operator to associate with the definition */
        operator: string,

        /** Operator definition */
        definition: LogicOperator
    ) : this;
}
// #endregion Logic Operator Map

// #region Comparison Operator Map

/** Performs a comparison-operation on the given inputs
 * @returns The result of the operation
*/
export type ComparisonOperatorFnc = (data: EvaluateData, v1: unknown, v2?: unknown) => boolean | Promise<boolean>;

/** Comparison Operator Definition */
export interface ComparisonOperator {

    right?: 'never' | 'optional' | 'required';

    /** During evaluation of the comparison operator called prior to `argsCheck()` and `evaluate()` */
    preeval?: PreEval;

    /** During evaluation of the comparison operator called to validate arguments prior to calling `evaluate()` */
    argsCheck?: ArgsCheck;

    /** Function to call to handle evaluation of the variable */
    evaluate: ComparisonOperatorFnc;
}

/** Represents a list of comparison operators */
export interface ComparisonOperatorMap extends Map<string, ComparisonOperator> {

    /** Check if the operator is used as a key within the map */
    has(
        /** Operator to check */
        operator: string
    ) : boolean;

    /** Returns the comparison operator definition associated with the specified operator */
    get(
        /** Operator of which to retrieve the definition */
        operator: string
    ) : undefined | ComparisonOperator;

    /** Stores the given operator definition */
    set(
        /** Operator to associate with the definition */
        operator: string,

        /** Operator definition */
        definition: ComparisonOperator
    ) : this;
};

// #endregion Comparison Operator Map

/** Result of a `tokenize()` attempt */
export type TokenizeResult<T = BaseToken> = [success: false] | [success: true, updatedCursor: number, result: T];

/** Options when Tokenizing an expression */
export interface TokenizeOptions {

    /** The expression to tokenize */
    expression: string;

    /** A map of Lookup handlers available to be accessed by the expression*/
    lookups: LookupMap;

    /** A map of variable handlers available to be accessed by the expression */
    variables: VariableMap;

    /** A map of additional condition logical operators */
    logicalOperators?: LogicOperatorMap;

    /** A map of additional condition comparison operators */
    comparisonOperators?: ComparisonOperatorMap;
}

/** Options when evaluating a tokenized expression */
export interface EvaluateOptions extends TokenizeOptions {

    /** When true the parser will only validate syntax, variable existence and lookup existence */
    onlyValidate?: boolean;

    /** Function to be called just prior to evaluating any variable or lookup */
    preeval?: PreEval;

    /** Data to be passed into variable and/or lookup evaluators */
    data?: EvaluateData;
}