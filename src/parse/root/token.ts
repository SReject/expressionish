import SequenceToken from '../sequence-token';

export type RootTokenOptions = TokenizeOptions;
export interface RootEvaluateOptions {
    onlyValidate?: boolean;
    preeval?: PreEvalFnc;
    metadata?: EvaluateMetaData;
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
        this.lookups = options.lookups;
        this.variables = options.variables;
        this.expression = options.expression;
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