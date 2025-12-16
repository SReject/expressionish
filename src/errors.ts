/** Represents a generic error when attempting to parse an expression */
export class ExpressionError extends Error {
    /** When defined: where the error was encountered within the expression text */
    position?: number;

    constructor(
        /** Message to associate with the error */
        message: string,

        /** Where the error was encountered within the expression text */
        position?: number
    ) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.message = message;
        this.position = position;
    }
}

/** Represents an error related to the arguments list or a singular argument to be passed to a variable */
export class ExpressionArgumentsError extends ExpressionError {

    /** The index of the argument in the arguments list */
    index?: number;

    /** The variable name the arguments list belongs to */
    varname?: string;

    constructor(
        /** Message to associate with the error */
        message: string,

        /** Where the error was encountered within the expression text */
        position?: number,

        /** The index of the argument in the arguments list */
        index?: number,

        /** The variable name the arguments list belongs to */
        varname?: string
    ) {
        super(message, position);
        Error.captureStackTrace(this, this.constructor);
        this.index = index || -1;
        this.varname = varname;
    }
}

/** Represents an error related to parsing a variable */
export class ExpressionVariableError extends ExpressionError {

    /** The associated variable name */
    varname?: string;

    constructor(
        /** Message to associate with the error */
        message: string,

        /** Where the error was encountered within the expression text */
        position?: number,

        /** The variable name to associate with the error */
        varname?: string
    ) {
        super(message, position);
        Error.captureStackTrace(this, this.constructor);
        this.varname = varname;
    }
}

/** Represents a syntax error within the given expression */
export class ExpressionSyntaxError extends ExpressionError {

    /** The character associated with the error */
    character?: string;

    constructor(

        /** Message to associate with the error */
        message: string,

        /** Where the error was encountered within the expression text */
        position?: number,

        /** The character associated with the error */
        character?: string
    ) {
        super(message, position);
        Error.captureStackTrace(this, this.constructor);
        this.character = character;
    }
}