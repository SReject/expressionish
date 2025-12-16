export interface BaseTokenJSON {
    position: number;
    type: string;
    value?: unknown;
}

export interface TextTokenJSON extends BaseTokenJSON {
    value: string;
}

export interface SequenceTokenJSON extends BaseTokenJSON {
    value: Array<LookupTokenJSON | IfTokenJSON | VariableTokenJSON | TextTokenJSON | SequenceTokenJSON>;
}

export interface ArgumentsTokenJSON extends BaseTokenJSON {
    value: Array<GroupedTokensJSON>;
}

export interface LookupTokenJSON extends BaseTokenJSON {
    prefix: string;
    value: string;
    arguments?: ArgumentsTokenJSON;
}

export interface ComparisonTokenJSON extends BaseTokenJSON {
    value: string;
    left: GroupedTokensJSON;
    right?: GroupedTokensJSON;
}

export interface LogicTokenJSON extends BaseTokenJSON {
    value: string,
    arguments: ArgumentsTokenJSON
}

export interface IfTokenJSON extends BaseTokenJSON {
    value: ComparisonTokenJSON | LogicTokenJSON;
    whenTrue: GroupedTokensJSON;
    whenFalse?: GroupedTokensJSON;
}
export interface VariableTokenJSON extends BaseTokenJSON {
    value: string;
    arguments?: ArgumentsTokenJSON;
}

export type GroupedTokensJSON = LookupTokenJSON | IfTokenJSON | VariableTokenJSON | TextTokenJSON | SequenceTokenJSON;

export type RootTokenJSON = SequenceTokenJSON | LookupTokenJSON | IfTokenJSON | VariableTokenJSON | TextTokenJSON;