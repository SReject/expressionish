import type { RootTokenJSON } from '../../tojson-types';
import type { TokenizeOptions, PreEval, EvaluateData, LookupMap, VariableMap, LogicOperatorMap, ComparisonOperatorMap } from '../../types';

import SequenceToken from '../sequence-token';

export type RootTokenOptions = TokenizeOptions;
export interface RootEvaluateOptions {
    onlyValidate?: boolean;
    preeval?: PreEval;
    data?: EvaluateData;
}

export default class RootToken extends SequenceToken {
    lookups: LookupMap;
    variables: VariableMap;
    expression: string;
    logicOperators: LogicOperatorMap;
    comparisonOperators: ComparisonOperatorMap;

    constructor(options: RootTokenOptions) {
        super({
            position: 0
        });
        this.type = 'ROOT'
        this.lookups = options.lookups;
        this.variables = options.variables;
        this.logicOperators = options.logicalOperators || new Map();
        this.comparisonOperators = options.comparisonOperators || new Map();
        this.expression = options.expression;
    }
    toJSON(): RootTokenJSON {
        return super.toJSON();
    }

    async evaluate(options: RootEvaluateOptions = {}): Promise<unknown> {
        return super.evaluate({
            ...options,
            lookups: this.lookups,
            variables: this.variables,
            logicalOperators: this.logicOperators,
            comparisonOperators: this.comparisonOperators,
            expression: this.expression
        });
    }
}