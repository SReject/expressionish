import type { RootTokenJSON } from '../../tojson-types';
import type { TokenizeOptions, PreEval, EvaluateData, LookupMap, VariableMap } from '../../types';

import SequenceToken from '../sequence-token';

export type RootTokenOptions = TokenizeOptions;
export interface RootEvaluateOptions {
    onlyValidate?: boolean;
    preeval?: PreEval;
    data?: EvaluateData;
    lookups?: LookupMap;
    variables?: VariableMap;
}

export default class RootToken extends SequenceToken {
    lookups: LookupMap;
    variables: VariableMap;
    expression: string;

    constructor(options: RootTokenOptions) {
        super({
            position: 0
        });
        this.type = 'ROOT'
        this.lookups = options.lookups;
        this.variables = options.variables;
        this.expression = options.expression;
    }
    toJSON(): RootTokenJSON {
        return super.toJSON();
    }

    async evaluate(options: RootEvaluateOptions = {}): Promise<unknown> {
        return super.evaluate({
            lookups: this.lookups,
            variables: this.variables,
            ...options,
            expression: this.expression
        });
    }
}