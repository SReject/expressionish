import has from './helpers/has';

import tokenize from './parse';
import Expression from './parse/expression';
import { type default as Token } from './parse/token';

const enum ArgumentType {
    VALUE,
    CONDITION
}

const enum ComparisonQuantifier {
    LEFTONLY,
    RIGHTOPTIONAL,
    RIGHTREQUIRED
}

const enum ComparisonBlockQuantifier {
    PRE,
    POST
}

type IEOLTransformer = (char: string) => Promise<string>;
type IEndOfLine = 'error' | 'remove' | 'space' | 'keep' | IEOLTransformer;

type disposition = 'append' | 'replace';

interface ISpecialSequences {
    disposition?: disposition;
    sequences: Record<string, string>;
}

type IMeta = Record<string, unknown>;

type IEvaluate = (options: IEvaluateOptions, meta: IMeta, ...args: Token[]) => Promise<unknown>;

interface IComparisonInverseOperator {
    signifier?: string | string[];
    evaluate?: IEvaluate;
}

interface IComparisonOperator {
    signifier: string | string[];
    cased?: boolean;
    quantifier: ComparisonQuantifier;
    inverse?: boolean | IComparisonInverseOperator;
    evaluate: IEvaluate;
}

interface IBlockOperator extends Omit<IComparisonOperator, 'cased' | 'quantifier' | 'inverse'> {
    quantifier: ComparisonBlockQuantifier;
    defer?: boolean
}

interface IOperatorOptions<T> {
    disposition?: disposition;
    operators?: Array<T>;
}

interface ArgumentsDescriptor {
    type: ArgumentType;
    multi: boolean;
    optional?: boolean;
}

interface IFunctionHandler {
    defer?: boolean;
    arguments?: ArgumentsDescriptor[];
    stackCheck?: (options: IEvaluateOptions, meta: IMeta, stack: string[]) => Promise<void>;
    argsCheck?: (options: IEvaluateOptions, meta: IMeta, ...args: Token[]) => Promise<void>;
    evaluate: (options: IEvaluateOptions, meta: IMeta, ...args: Token[]) => Promise<unknown>;
}

type IFunctionHandlers = Record<string, IFunctionHandler>;
type IFunctionLookupHandler = (options: IEvaluateOptions, meta: IMeta, name: string) => Promise<IFunctionHandler>;
type IFunctionLookupHandlers = Record<string, IFunctionLookupHandler>;

interface IExpressionishOptions {
    eol?: IEndOfLine;
    specialSequences?: boolean | ISpecialSequences;

    comparisonOperators?: boolean | IOperatorOptions<IComparisonOperator>;
    blockOperators?: boolean | IOperatorOptions<IBlockOperator>;

    functionHandlers?: boolean | IFunctionHandlers;
    functionLookupHandlers?: IFunctionLookupHandlers;
}

interface IEvaluateOptions {
    verifyOnly?: boolean;
    skipStackChecks?: boolean;
    skipArgumentsChecks?: boolean;
}

const defaultSpecialSequences : Record<string, string> = {
    '\\t': '\t',
    '\\n': '\n',
    '\\r': '\r'
};

interface IExpandedOperator<T> {
    signifier: string[];
    cased: boolean;
    defer: boolean;
    quantifier: T;
    inverse: false | {
        signifier: string[];
        evaluate: IEvaluate;
    };
    evaluate: IEvaluate;
}

const isArrayOfString = (subject: unknown[]) : boolean => {
    if (!Array.isArray(subject)) {
        return false;
    }
    return (<Array<unknown>>subject).every((value: unknown) => {
        return (
            typeof value === 'string' &&
            value !== '' &&
            value !== ' ' &&
            value !== '\t' &&
            value !== '\n' &&
            value !== '\r'
        );
    });
};

export class Expressionish {

    private eol : IEndOfLine;
    private specialSequences : Record<string, string>;

    private comparisonOperators: Record<string, IComparisonOperator>;
    private blockOperators: Record<string, IBlockOperator>;

    private functionHandlers : IFunctionHandlers;
    private functionLookupHandlers : IFunctionLookupHandlers;

    constructor(options: IExpressionishOptions = {}) {

        if (options.eol == null) {
            this.eol === 'keep';
        } else {
            this.eol = options.eol;
        }


        // special sequences
        if (options.specialSequences === false) {
            this.specialSequences = {};

        } else  if (options.specialSequences == null || options.specialSequences === true) {
            this.specialSequences = { ...defaultSpecialSequences };

        } else if (options.specialSequences.disposition === 'replace') {
            this.specialSequences = { ...(options.specialSequences.sequences)};

        } else {
            this.specialSequences = { ...defaultSpecialSequences, ...(options.specialSequences.sequences) };
        }


        // comparison operators
        this.comparisonOperators = {};
        if (
            options.comparisonOperators == null ||
            options.comparisonOperators === true ||
            (<IOperatorOptions<IComparisonOperator>>options.comparisonOperators)?.disposition === 'append'
        ) {
            defaultComparisonOperators.forEach((operator: IComparisonOperator) => {
                this.registerComparisonOperator(operator);
            });
        }
        if ((<IOperatorOptions<IComparisonOperator>>options.comparisonOperators)?.operators != null) {
            (<IOperatorOptions<IComparisonOperator>>options.comparisonOperators)?.operators.forEach((operator: IComparisonOperator) => {
                this.registerComparisonOperator(operator);
            });
        }


        // block operators
        this.blockOperators = {};
        if (
            options.blockOperators == null ||
            options.blockOperators === true ||
            (<IOperatorOptions<IBlockOperator>>options.blockOperators)?.disposition === 'append'
        ) {
            defaultBlockOperators.forEach((operator: IBlockOperator) => {
                this.registerComparisonOperator(operator);
            });
        }
        if ((<IOperatorOptions<IBlockOperator>>options.blockOperators)?.operators != null) {
            (<IOperatorOptions<IBlockOperator>>options.blockOperators)?.operators.forEach((operator: IBlockOperator) => {
                this.registerBlockOperator(operator);
            });
        }


        // function handlers
        if (
            options.functionHandlers == null ||
            options.functionHandlers === false
        ) {
            this.functionHandlers = {};

        } else if (options.functionHandlers === true) {
            // TODO: register $if[]

        } else {
            this.functionHandlers = options.functionHandlers;
        }


        // function lookups
        if (options.functionLookupHandlers == null) {
            this.functionLookupHandlers = {};

        } else {
            this.functionLookupHandlers = options.functionLookupHandlers;
        }
    }


    registerSpecialSequence(key: string, value: string) {
        if (typeof key !== 'string' || key.length !== 1) {
            // error
        } else if (key === ' ') {
            // error
        } else if (typeof value !== 'string' || key.length < 1) {
            // error
        } else if (has(this.specialSequences, key)) {
            // error
        } else {
            this.specialSequences[key] = value;
        }
    }


    registerComparisonOperator(operator: IComparisonOperator) {

        const expandedOperator : Partial<IExpandedOperator<ComparisonQuantifier>> = {};

        if (typeof operator.signifier === 'string') {
            expandedOperator.signifier = [operator.signifier];
        } else if (isArrayOfString(operator.signifier)) {
            expandedOperator.signifier = operator.signifier;
        } else {
            throw new Error('TODO');
        }


        if (typeof operator.cased == null) {
            expandedOperator.cased = false;
        } else if (typeof operator.cased !== 'boolean') {
            throw new Error('TODO');
        } else {
            expandedOperator.cased = operator.cased;
        }


        expandedOperator.defer = false;


        if (
            operator.quantifier != null &&
            operator.quantifier !== ComparisonQuantifier.LEFTONLY &&
            operator.quantifier !== ComparisonQuantifier.RIGHTOPTIONAL &&
            operator.quantifier !== ComparisonQuantifier.RIGHTREQUIRED
        ) {
            throw new Error('TODO');
        }
        expandedOperator.quantifier = operator.quantifier;


        const inverse = operator.inverse;
        if (inverse == null || inverse === false) {
            expandedOperator.inverse = false;

        } else if (inverse !== true && typeof inverse !== 'object') {
            throw new Error('TODO');

        } else {
            let signifier : string[];
            let evaluate: IEvaluate;
            if (inverse == true || inverse.signifier == null) {
                signifier = expandedOperator.signifier.map((signifier: string) => `!${signifier}`);
            } else if (typeof inverse.signifier === 'string') {
                signifier = [inverse.signifier];
            } else if (isArrayOfString(signifier)) {
                signifier = inverse.signifier;
            } else {
                throw new Error('TODO');
            }
            if (inverse == true || inverse.evaluate == null) {
                evaluate = async (options: IEvaluateOptions, meta: IMeta, ...args: Token[]) : Promise<boolean> => {
                    return !(await operator.evaluate(options, meta, ...args));
                };
            } else if (typeof inverse.evaluate === 'function') {
                evaluate = inverse.evaluate;
            } else {
                throw new Error('TODO');
            }
            expandedOperator.inverse = {signifier, evaluate}
        }

        if (typeof operator.evaluate !== 'function') {
            throw new Error('TODO');
        } else {
            expandedOperator.evaluate = operator.evaluate;
        }

        for (let idx = 0; idx < expandedOperator.signifier.length; idx += 1) {
            const signifier = expandedOperator.signifier[idx].toLowerCase();
            const { cased, quantifier, evaluate } = expandedOperator;
            if (has(this.comparisonOperators, signifier)) {
                throw new Error('comparison operator already registered');
            }
            this.comparisonOperators[signifier] = { signifier, cased, quantifier, evaluate};
        }

        if (expandedOperator.inverse) {
            const { cased, quantifier, inverse } = expandedOperator;
            for (let idx = 0; idx < inverse.signifier.length; idx += 1) {
                const signifier = inverse.signifier[idx].toLowerCase();
                const evaluate = inverse.evaluate;
                if (has(this.comparisonOperators, signifier)) {
                    throw new Error('comparison operator already registered');
                }
                this.comparisonOperators[signifier] = { signifier, cased, quantifier, evaluate };
            }
        }
    }

    registerBlockOperator(operator: IBlockOperator) {
    }
    registerFunctionHandler(name: string, handler: IFunctionHandler) {
    }
    registerFunctionLookupHandler(prefix: string, handler: IFunctionLookupHandler) {
    }
}

export {
    ExpressionError,
    ExpressionArgumentsError,
    ExpressionSyntaxError,
    ExpressionVariableError
} from './errors';