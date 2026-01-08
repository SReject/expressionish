import tokenizeRoot from './parse/root/tokenize';

// because typescript is dumb
import {
    TokenizeOptions,
    ArgsCheck,
    PreEval,
    EvaluateData,
    EvaluateOptions,
    LookupFnc,
    LookupMap,
    LogicOperatorFnc,
    LogicOperator,
    LogicOperatorMap,
    ComparisonOperatorFnc,
    ComparisonOperator,
    ComparisonOperatorMap,
    VariableEvaluateFnc,
    Variable,
    VariableMap
} from './types';

export {
    TokenizeOptions,
    ArgsCheck,
    PreEval,
    EvaluateData,
    EvaluateOptions,
    LookupFnc,
    LookupMap,
    LogicOperatorFnc,
    LogicOperator,
    LogicOperatorMap,
    ComparisonOperatorFnc,
    ComparisonOperator,
    ComparisonOperatorMap,
    VariableEvaluateFnc,
    Variable,
    VariableMap
};

// because typescript is dumb
import { default as RootToken, RootTokenOptions, RootEvaluateOptions } from './parse/root/token'
export { RootToken, RootTokenOptions, RootEvaluateOptions };

export { default as ArgumentsToken, ArgumentsTokenOptions } from './parse/arguments/token';
export { default as BaseToken, BaseTokenOptions } from './parse/base-token';
export { default as ComparisonToken, ComparisonTokenOptions } from './parse/comparison/token';
export { default as IfToken, IfTokenOptions } from './parse/if/token';
export { default as LogicToken, LogicTokenOptions } from './parse/logic/token';
export { default as LookupToken, LookupTokenOptions } from './parse/lookup/token';
export { default as SequenceToken } from './parse/sequence-token';
export { default as TextToken, TextTokenOptions } from './parse/text/token';
export { default as VariableToken, VariableTokenOptions } from './parse/variable/token';
export { ExpressionError, ExpressionArgumentsError, ExpressionSyntaxError, ExpressionVariableError } from './errors';

/** Parses a string expression into a usable Expressionish-Token instance */
export const tokenize = (
    /** Options to use during tokenization */
    options: TokenizeOptions
) : RootToken => {
    if (options == null) {
        throw new TypeError('options not specified');
    }

    // Validate options.variables
    if (options.variables == null) {
        throw new TypeError('variables map is null');
    }
    if (!(options.variables instanceof Map)) {
        throw new TypeError('variables map is not a Map instance');
    }

    // validate options.lookups
    if (options.lookups == null) {
        options.lookups = new Map() as LookupMap;
    } else if (!(options.lookups instanceof Map)) {
        throw new TypeError('lookups option specified but is not a Map instance');
    }

    // validate options.LogicalOperators
    if (options.logicalOperators == null) {
        options.logicalOperators = new Map() as LogicOperatorMap;
    } else if (!(options.logicalOperators instanceof Map)) {
        throw new TypeError('logical operators options specified but is not a Map instance');
    }

    if (options.comparisonOperators == null) {
        options.comparisonOperators = new Map() as ComparisonOperatorMap;
    } else if (!(options.comparisonOperators instanceof Map)) {
        throw new TypeError('comparison operators options specified but is not a Map instance');
    }

    // validate options.expression
    if (options.expression == null) {
        throw new TypeError('expression not specified');
    }
    if (typeof options.expression !== 'string') {
        throw new TypeError('expression must be a string');
    }

    // tokenize the expression
    return tokenizeRoot(options);
}

/** Parses then evaluates expression text */
export const evaluate = async (
    /** Options passed to the parser and evaluator */
    options: EvaluateOptions
) => tokenize(options).evaluate({
    onlyValidate: options.onlyValidate,
    preeval: options.preeval,
    data: options.data
});