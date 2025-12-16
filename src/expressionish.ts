import tokenizeRoot from './parse/root/tokenize';
import { TokenizeOptions, LookupMap, EvaluateOptions } from './types';

export { default as BaseToken, BaseTokenOptions } from './parse/base-token';
export { default as ArgumentsToken, ArgumentsTokenOptions } from './parse/arguments/token';
export { default as ComparisonToken, ComparisonTokenOptions } from './parse/comparison/token';
export { default as IfToken, IfTokenOptions } from './parse/if/token';
export { default as LogicToken, LogicTokenOptions } from './parse/logic/token';
export { default as LookupToken, LookupTokenOptions } from './parse/lookup/token';
export { default as RootToken, RootTokenOptions, RootEvaluateOptions } from './parse/root/token';
export { default as TextToken, TextTokenOptions } from './parse/text/token';
export { default as VariableToken, VariableTokenOptions } from './parse/variable/token';
export { ExpressionError, ExpressionArgumentsError, ExpressionSyntaxError, ExpressionVariableError } from './errors';


/** Parses a string expression into a usable Expressionish-Token instance */
export const tokenize = (
    /** Options to use during tokenization */
    options: TokenizeOptions
) => {
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
        throw new TypeError('lookups map is not a Map instance');
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
    metadata: options.metadata
});