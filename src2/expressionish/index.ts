
export default class Expressionish {

    private functionDenoter : string;
    private specialDenoter : string;

    private groupingDenoter : IGroupDenoterQuantified;
    private quotesDenoters : IQuotesQuantified[];

    private endofline : IEndOfLineQuantified;

    constructor(options) {

    }

    registerOperator() {}
    registerOperators() {}

    registerFunctionHandler() {}
    registerFunctionHandlers() {}

    registerLookupHandler() {}
    registerLookupHandlers() {}

    tokenize() {}

    toJSON() {}
}