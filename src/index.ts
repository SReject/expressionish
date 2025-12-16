import { tokenize as split } from './misc/split'

import type BaseToken from './parse/base-token';
import SequenceToken from './parse/sequence-token';
import TextToken from './parse/text/token';

import tokenizeEscape from './parse/text/escape';
import tokenizeIf from './parse/if/tokenize';
import tokenizeLookup from './parse/lookup/tokenize';
import tokenizeVariable from './parse/variable/tokenize';

interface RootEvaluateOptions {
    onlyValidate?: boolean;
    preeval?: PreEvalFnc;
    metadata?: EvaluateMetaData;
    lookups?: LookupMap;
    variables?: VariableMap;
}

class RootToken extends SequenceToken {
    lookups: LookupMap;
    variables: VariableMap;
    expression: string;

    constructor(options: TokenizeOptions) {
        super({
            position: 0
        });
        this.lookups = options.lookups;
        this.variables = options.variables;
        this.expression = options.expression;
    }

    async evaluate(options: RootEvaluateOptions): Promise<unknown> {
        return super.evaluate({
            lookups: this.lookups,
            variables: this.variables,
            ...options,
            expression: this.expression
        });
    }
}

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

    const result = new RootToken(options);

    const tokens = split(options.expression);
    const count = tokens.length;
    let cursor = 0;

    while (cursor < count) {
        const [eTokenized, eCursor, eResult] = tokenizeEscape(tokens, cursor);
        if (eTokenized) {
            result.add(new TextToken(eResult));
            cursor = eCursor;
            continue;
        }

        let [tokenized, tCursor, tResult] : [tokenized: boolean, cursor?: number, result?: BaseToken] = tokenizeLookup(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as BaseToken);
            cursor = tCursor as number;
            continue
        }

        [tokenized, tCursor, tResult] = tokenizeIf(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as BaseToken);
            cursor = tCursor as number;
            continue
        }

        [tokenized, tCursor, tResult] = tokenizeVariable(tokens, cursor, options);
        if (tokenized) {
            result.add(tResult as BaseToken);
            cursor = tCursor as number;
            continue
        }

        result.add(new TextToken(tokens[cursor]));
        cursor += 1;
    }

    return result;
}

export const evaluate = async (options: EvaluateOptions) => await tokenize(options).evaluate({
    onlyValidate: options.onlyValidate,
    preeval: options.preeval,
    metadata: options.metadata
});