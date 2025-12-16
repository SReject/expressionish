import type BaseToken from './parse/base-token';

/** Result of a `tokenize()` attempt */
export type TokenizeResult<T = BaseToken> = [success: false] | [success: true, updatedCursor: number, result: T];

/** Data to be passed to variables when they are to be evaluated */
export type EvaluateMetaData = Record<string | number | symbol, unknown>;

/** Function to call to validate a variable's arguments
 * @throws {import("./errors.ts").ExpressionArgumentsError} If an argument or the arguments list is invalid
*/
export type ArgsCheck = (
    /** meta data passed to the evaluate() call */
    data: EvaluateMetaData,

    /** Arguments passed to the variable */
    ...args: unknown[]
) => Promise<never>;

/** Function to call just prior to evaluating a variable or looked up variable */
export type PreEval = (
    /** Options passed to the `<root>.evaluate()` function */
    options: EvaluateOptions,

    /** Array of arguments to be passed to the variable's `evaluate()` function */
    ...args: unknown[]
) => Promise<never>;

/** Represents a variable definition */
export interface Variable {

    /** Function to call to validate arguments prior to evaluating the variable */
    argsCheck?: ArgsCheck;

    /** Function to call just prior to evaluating the variable */
    preeval?: PreEval;

    /** Function to call to evaluate the variable */
    evaluate: (data: EvaluateMetaData, ...args: unknown[]) => Promise<unknown>;
}

/** Represents a Map of variables where
 * - the key is the variable's name
 * - the value is the variable's definition
 */
export type VariableMap = Map<string, Variable>;

/** Represents a Lookup handler
 * @returns {undefined | Variable} A variable declaration or undefined
*/
export type LookupFnc = (
    /** The variable name to look up */
    name: string
) => undefined | Variable;

/** Represents a Map of Lookup handlers where
 * * the key is the lookup variable-prefix
 * * the value is the function to handle the lookup
*/
export type LookupMap = Map<string, LookupFnc>;

/** Options when Tokenizing an expression */
export interface TokenizeOptions {

    /** The expression to tokenize */
    expression: string;

    /** A map of Lookup handlers available to be accessed by the expression*/
    lookups: LookupMap;

    /** A map of variable handlers available to be accessed by the expression */
    variables: VariableMap;
}

/** Options when evaluating a tokenized expression */
export interface EvaluateOptions extends TokenizeOptions {

    /** When true the parser will only validate syntax, variable existence and lookup existence */
    onlyValidate?: boolean;

    /** Function to be called just prior to evaluating any variable or lookup */
    preeval?: PreEval;

    /** Data to be passed into variable and/or lookup evaluators */
    metadata?: EvaluateMetaData;
}

/** Represents a small portion of an expression's text that may or may not have significance to the parser */
export interface GenericToken {

    /** The position of the generic token within the expression text */
    position: number;

    /** The character(s) comprising the token */
    value: string;
}