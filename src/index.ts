import tokenizeRoot from './parse/root/tokenize';

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

export const tokenize = (options: TokenizeOptions) => {
    if (options == null) {
        throw new TypeError('options not specified');
    }

    // variables
    if (options.variables == null) {
        throw new TypeError('variables list is null');
    }
    if (!(options.variables instanceof Map)) {
        throw new TypeError('variables list is not a Map instance');
    }

    // lookups
    if (options.lookups == null) {
        options.lookups = new Map() as LookupMap;
    } else if (!(options.lookups instanceof Map)) {
        throw new TypeError('lookups list is not a Map instance');
    }

    if (options.expression == null) {
        throw new TypeError('expression not specified');
    }
    if (typeof options.expression !== 'string') {
        throw new TypeError('expression must be a string');
    }
    return tokenizeRoot(options);
}

export const evaluate = async (options: EvaluateOptions) => await tokenize(options).evaluate({
    onlyValidate: options.onlyValidate,
    preeval: options.preeval,
    metadata: options.metadata
});