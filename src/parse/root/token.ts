import type { RootTokenJSON } from '../../tojson-types';
import type { TokenizeOptions, PreEval, EvaluateData, LookupMap, VariableMap, LogicOperatorMap, ComparisonOperatorMap } from '../../types';

import SequenceToken from '../sequence-token';

/** Represents the options for a new RootToken instance */
export type RootTokenOptions = TokenizeOptions;

/** Represents the options passed to a RootToken instance's `evaluate()` function */
export interface RootEvaluateOptions {

    /** When true, only validation will occur. Logic Operators, Comparison Operators, Variable & Lookups will not be evaluated */
    onlyValidate?: boolean;

    /** Called just prior to evaluating each variable and/or lookup */
    preeval?: PreEval;

    /** Data to pass to Logic Operators, Comparison Operators, Variables and Lookup results' `evaluate()` functions */
    data?: EvaluateData;
}

/** Wrapper token representing the `tokenized()` expression */
export default class RootToken extends SequenceToken {

    /** Map of externally defined Lookup Handlers */
    lookups: LookupMap;

    /** Map of externally defined Variables */
    variables: VariableMap;

    /** Map of externally defined Logic Operators */
    logicOperators: LogicOperatorMap;

    /** Map of exernally defined Comparison Operators */
    comparisonOperators: ComparisonOperatorMap;

    /** Expression that is/was tokenized */
    expression: string;

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

    /** Converts the token to a JSON.stringify()-able object */
    toJSON(): RootTokenJSON {
        return super.toJSON();
    }

    /** Evaluates the token */
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