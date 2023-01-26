import has from '../helpers/has';
import freeze from '../helpers/deep-freeze';

import { IQuantifiedList, verifyQuantifiedList } from './options/_support';

import quantifyEndOfLine, {
    type IEndOfLineOptions,
    type IEndOfLineQuantified
} from './options/end-of-line';

import quantifySpecialSignifier from './options/special-signifier';

import quantifyFunctionSignifier from './options/function-signifier';

import quantifyGroupSignifier, {
    type IGroupSignifierOptions,
    type IGroupSignifierQuantified
} from './options/group-signifier';

import quantifyQuotesSignifiers, {
    type IQuotesOptions,
    type IQuotesQuantified
} from './options/quotes-signifiers'

import quantifySpecialSequences, {
    type ISpecialSequencesOptions,
    type ISpecialSequencesQuantified
} from './options/special-sequences';

import expandOperator, {
    OperatorQuantifier,
    type IOperatorOptionsDefinition,
    type IOperatorOptions,
    type IOperatorQuantified
} from './options/operators';

import quantifyFunctionHandlers, {
    type IFunctionHandlersOptions,
    type IFunctionHandlersQuantified
} from './options/function-handlers';




import {
    type IHandleFnc,
    // type IOperatorDefinition,
    type ILookupHandler,
} from './options';
import defaultComparisonOperators from './default/comparison-operators';
import defaultBlockOperators from './default/block-operators';
import defaultFunctionHandlers from './default/function-handlers';
import { ExpressionError, ExpressionArgumentsError, ExpressionSyntaxError, ExpressionVariableError } from '../errors';




interface IExpressionOptions {
    eol?: IEndOfLineOptions;
    specialSignifier?: string;
    functionSignifier?: string;
    groupSignifier?: IGroupSignifierOptions;
    quotes?: IQuotesOptions;
    specialSequences?: ISpecialSequencesOptions;
    comparisonOperators?: IOperatorOptions;
    blockOperators?: IOperatorOptions;

    functionHandlers?: IFunctionHandlersOptions;

}
class Expressionish {

    private eol : IEndOfLineQuantified;
    private specialSignifier: string;
    private functionSignifier : string;
    private groupSignifier: IGroupSignifierQuantified;
    private quotes : IQuotesQuantified[];
    private specialSequences : ISpecialSequencesQuantified;
    private comparisonOperators: Record<string, IOperatorQuantified>;
    private blockOperators: Record<string, IOperatorQuantified>;
    private functionHandlers : Record<string, IFunctionHandlersQuantified>;

    private lookupHandlers : Record<string, ILookupHandler>;

    constructor(options: IExpressionOptions = {}) {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const define = (key: string, value: unknown, deepFreeze = false) => {
            return Object.defineProperty(this, key, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: freeze(value, deepFreeze)
            });
        }


        define(
            'eol',
            quantifyEndOfLine(options.eol)
        );


        define(
            'specialSignifier',
            quantifySpecialSignifier(options.specialSignifier)
        );
        const signifiers : string[] = [this.specialSignifier];


        define(
            'functionSignifier',
            quantifyFunctionSignifier(
                options.functionSignifier,
                signifiers
            )
        );
        signifiers.push(this.functionSignifier);


        define('groupSignifier',
            quantifyGroupSignifier(
                options.groupSignifier,
                signifiers
            ),
            true
        );
        signifiers.push(this.groupSignifier.open, this.groupSignifier.delimiter, this.groupSignifier.close);


        define('quotes',
            quantifyQuotesSignifiers(
                options.quotes,
                [
                    this.specialSignifier,
                    this.functionSignifier,
                    this.groupSignifier.open,
                    this.groupSignifier.delimiter,
                    this.groupSignifier.close
                ]
            ),
            true
        );
        this.quotes.forEach(quoteDef => {
            if (!signifiers.includes(quoteDef.open))
                signifiers.push(quoteDef.open);
            if (!signifiers.includes(quoteDef.close))
                signifiers.push(quoteDef.close);
        });



        define(
            'specialSequences',
            quantifySpecialSequences(options.specialSequences),
            true
        );


        /* #region Comparison Operators */
        define('comparisonOperators', {});
        /*
        define(
            'comparisonOperators',
            quantifyOperators(
                options.comparisonOperators,
                signifiers,
                defaultComparisonOperators,
                {}
            )
        );
        define(
            'blockOperators',
            quantifyOperators(
                options.blockOperators,
                signifiers,
                defaultBlockOperators,
                this.comparisonOperators
            )
        )
        */
        const comparisonOperators = options.comparisonOperators;
        if (comparisonOperators == null || comparisonOperators === true) {
            this.registerComparisonOperators(defaultComparisonOperators);

        } else if (typeof comparisonOperators === 'object') {
            verifyQuantifiedList(comparisonOperators);
            if (comparisonOperators.disposition === 'append') {
                this.registerComparisonOperators(defaultComparisonOperators);
            }
            this.registerComparisonOperators(comparisonOperators.items);
        } else if (comparisonOperators !== false) {
            throw new Error('TODO');
        }
        /* #endregion */


        /* #region Block Operators */
        define('blockOperators', {});
        const blockOperators = options.blockOperators;
        if (blockOperators == null || blockOperators === true) {
            this.registerBlockOperators(defaultBlockOperators);
        } else if (typeof blockOperators === 'object') {
            verifyQuantifiedList(blockOperators);
            if (blockOperators.disposition === 'append') {
                this.registerBlockOperators(defaultBlockOperators);
            }
            this.registerBlockOperators(blockOperators.items);
        } else if (blockOperators !== false) {
            throw new Error('TODO');
        }
        /* #endregion */


        /* #region Function Handlers */
        define('functionHandlers', {});
        const functionHandlers = options.functionHandlers;
        if (functionHandlers == null || functionHandlers === true) {
            this.registerFunctionHandlers(defaultFunctionHandlers);
        } else if (typeof functionHandlers === 'object') {
            verifyQuantifiedList(functionHandlers);
            if (functionHandlers.disposition === 'append') {
                this.registerFunctionHandlers(defaultFunctionHandlers);
            }
            this.registerFunctionHandlers(functionHandlers.items);
        } else if (functionHandlers !== false) {
            throw new Error('TODO');
        }


        /* #region lookup handlers */
        define('lookupHandlers', {});
        if (typeof options.lookupHandlers !== 'object') {
            throw new Error('TODO');
        } else if (options.lookupHandlers != null) {
            this.registerLookupHandlers(options.lookupHandlers);
        }
        /* #endregion */


        Object.freeze(this);
    }



    registerComparisonOperator(operator: IOperatorOptionsDefinition) {
        const signifiers : string[] = [
            this.specialSignifier,
            this.functionSignifier,
            this.groupSignifier.open,
            this.groupSignifier.delimiter,
            this.groupSignifier.close
        ];
        this.quotes.forEach(quotedef => {
            if (!signifiers.includes(quotedef.open)) {
                signifiers.push(quotedef.open);
            }
            if (!signifiers.includes(quotedef.close)) {
                signifiers.push(quotedef.close);
            }
        });

        expandOperator(signifiers, this.comparisonOperators, operator);
    }
    registerComparisonOperators(operators: IOperatorOptionsDefinition[]) {
        if (!Array.isArray(operators)) {
            throw new Error('TODO');
        }
        operators.forEach(operator => this.registerComparisonOperator(operator));
    }



    registerBlockOperator(operator: IOperatorOptionsDefinition) {
        const signifiers : string[] = [
            this.specialSignifier,
            this.functionSignifier,
            this.groupSignifier.open,
            this.groupSignifier.delimiter,
            this.groupSignifier.close
        ];
        this.quotes.forEach(quotedef => {
            if (!signifiers.includes(quotedef.open)) {
                signifiers.push(quotedef.open);
            }
            if (!signifiers.includes(quotedef.close)) {
                signifiers.push(quotedef.close);
            }
        });
        expandOperator(signifiers, this.blockOperators, operator)
    }
    registerBlockOperators(operators: IOperatorOptionsDefinition[]) {
        if (!Array.isArray(operators)) {
            throw new Error('TODO');
        }
        operators.forEach(operator => this.registerBlockOperator(operator));
    }



    registerFunctionHandler(name: string, handler: IFunctionHandler | IHandleFnc<unknown>) {
        if (typeof name !== 'string') {
            throw new Error('TODO');
        } else if (!/^[a-z][a-z\d]{2,}$/i.test(name)) {
            throw new Error('TODO');
        } else if (has(this.functionHandlers, name.toLowerCase())) {
            throw new Error('TODO');
        } else if (typeof handler === 'function') {
            this.functionHandlers[name.toLowerCase()] = { defer: false, evaluate: handler };
        } else if (handler == null || typeof handler !== 'object') {
            throw new Error('TODO');
        } else if (handler.defer != null && typeof handler.defer !== 'boolean') {
            throw new Error('TODO');
        } else if (handler.stackCheck != null && typeof handler.stackCheck !== 'function') {
            throw new Error('TODO');
        } else if (handler.argsCheck != null && typeof handler.argsCheck !== 'function') {
            throw new Error('TODO');
        } else if (handler.evaluate == null || typeof handler.evaluate !== 'function') {
            throw new Error('TODO');
        } else {
            const { defer, stackCheck, argsCheck, evaluate } = handler;
            this.functionHandlers[name.toLowerCase()] = Object.freeze({
                defer: !!defer,
                stackCheck,
                argsCheck,
                evaluate
            });
        }
    }
    registerFunctionHandlers(list: Record<string, IFunctionHandler | IHandleFnc<unknown>>) {
        if (list == null) {
            throw new Error('TODO');
        } else if (typeof list !== 'object') {
            throw new Error('TODO');
        } else {
            Object.keys(list).forEach(prefix => {
                this.registerFunctionHandler(prefix, list[prefix]);
            });
        }
    }
    registerLookupHandler(prefix: string, handler: ILookupHandler) {
        if (typeof prefix !== 'string') {
            throw new Error('TODO');
        } else if (
            prefix === '' ||
            /[!\s\\[,\]"`]/.test(prefix) ||
            prefix.includes(this.functionSignifier)
        ) {
            throw new Error('TODO');
        } else if (has(this.lookupHandlers, prefix.toLowerCase())) {
            throw new Error('TODO');
        } else if (typeof handler !== 'function') {
            throw new Error('TODO');
        } else {
            this.lookupHandlers[prefix.toLowerCase()] = handler;
        }
    }
    registerLookupHandlers(list: Record<string, ILookupHandler>) {
        if (list == null) {
            throw new Error('TODO');
        } else if (typeof list !== 'object') {
            throw new Error('TODO');
        } else {
            Object.keys(list).forEach(prefix => {
                this.registerLookupHandler(prefix, list[prefix]);
            });
        }
    }

    tokenize(subject: string) {
        // todo
    }

    toJSON() : Record<string, unknown> {
        const comparisonOperators : Record<string, unknown> = {};
        Object.keys(this.comparisonOperators).forEach(operatorName => {
            const { signifier, quantifier, cased, defer } = this.comparisonOperators[operatorName];
            comparisonOperators[operatorName] = { signifier, quantifier, cased, defer };
        });

        const blockOperators : Record<string, unknown> = {};
        Object.keys(this.blockOperators).forEach(operatorName => {
            const { signifier, quantifier, cased, defer } = this.blockOperators[operatorName];
            blockOperators[operatorName] = { signifier, quantifier, cased, defer };
        });

        const functionHandlers : Record<string, unknown> = {};
        Object.keys(this.functionHandlers).forEach(funcName => {
            const { defer } = this.functionHandlers[funcName];
            functionHandlers[funcName] = { defer };
        });

        return {
            eol: this.eol.quantifier,
            escapeSignifier: this.escapeSignifier,
            functionSignifier: this.functionSignifier,
            groupSignifier: this.groupSignifier,
            quotes: this.quotes,
            specialSequences: this.specialSequences,
            comparisonOperators,
            blockOperators,
            functionHandlers,
            lookupHandlers: Object.keys(this.lookupHandlers)
        };
    }
}

export {
    ExpressionError,
    ExpressionSyntaxError,
    ExpressionVariableError,
    ExpressionArgumentsError,

    OperatorQuantifier,
    type IOperatorDefinition,
    type IFunctionHandler,
    type ILookupHandler,
    type IExpressionOptions,

    Expressionish,
    Expressionish as default,
};