
/** Base that all other Token JSON inherit from */
export interface BaseTokenJSON {

    /** Token's position withing the expression text */
    position: number;

    /** Token Type */
    type: string;

    /** Value of the token */
    value?: unknown;
}

/** Represents a Text Token */
export interface TextTokenJSON extends BaseTokenJSON {

    /** The text of the token */
    value: string;
}

/** Represets a Sequence Token */
export interface SequenceTokenJSON extends BaseTokenJSON {

    /** The tokens making up the sequence */
    value: Array<LookupTokenJSON | IfTokenJSON | VariableTokenJSON | TextTokenJSON | SequenceTokenJSON>;
}

/** Represents an Argument Token */
export interface ArgumentsTokenJSON<T = GroupedTokensJSON> extends BaseTokenJSON {

    /** Arguments of the token */
    value: Array<T>;
}

/** Represents a Lookup Token */
export interface LookupTokenJSON extends BaseTokenJSON {

    /** The prefix of the variable */
    prefix: string;

    /** The variable to be looked up */
    value: string;

    /** Arguments to be passed to the looked up variable during evaluation */
    arguments?: ArgumentsTokenJSON;
}

/** Represents a Comparison Token */
export interface ComparisonTokenJSON extends BaseTokenJSON {

    /** The comparison operator */
    value: string;

    /** The left-hand side of the comparison */
    left: GroupedTokensJSON;

    /** The right-hand side of the comparison */
    right?: GroupedTokensJSON;
}

/** Represents a Logic Token */
export interface LogicTokenJSON extends BaseTokenJSON {

    /** The logic operator */
    value: string,

    /** Arguments to be passed to the logic operator's handler */
    arguments: ArgumentsTokenJSON<LogicTokenJSON | ComparisonTokenJSON | GroupedTokensJSON>
}

/** Represents an If Token */
export interface IfTokenJSON extends BaseTokenJSON {

    /** The condition */
    value: ComparisonTokenJSON | LogicTokenJSON;

    /** Value to return when the condition is truthy */
    whenTrue: GroupedTokensJSON;

    /** Value to return when the condition is falsy */
    whenFalse?: GroupedTokensJSON;
}

export interface VariableTokenJSON extends BaseTokenJSON {
    value: string;
    arguments?: ArgumentsTokenJSON;
}

export type GroupedTokensJSON = LookupTokenJSON | IfTokenJSON | VariableTokenJSON | TextTokenJSON | SequenceTokenJSON;

export type RootTokenJSON = SequenceTokenJSON | LookupTokenJSON | IfTokenJSON | VariableTokenJSON | TextTokenJSON;