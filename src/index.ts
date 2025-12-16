import tokenizeRoot from './parse/root/tokenize';

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