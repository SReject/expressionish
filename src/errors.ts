export class ExpressionError extends Error {
    position?: number;

    constructor(message: string, position?: number) {
        super(message);

        Error.captureStackTrace(this, this.constructor);
        this.message = message;
        this.position = position;
    }
}

export class ExpressionArgumentsError extends ExpressionError {
    index?: number;
    varname?: string;
    constructor(message: string, position?: number, index?: number, varname?: string) {
        super(message, position);

        Error.captureStackTrace(this, this.constructor);
        this.index = index || -1;
        this.varname = varname;
    }
}

export class ExpressionVariableError extends ExpressionError {
    varname?: string;
    constructor(message: string, position?: number, varname?: string) {
        super(message, position);

        Error.captureStackTrace(this, this.constructor);
        this.varname = varname;
    }
}

export class ExpressionSyntaxError extends ExpressionError {
    character?: string;
    constructor(message: string, position?: number, character?: string) {
        super(message, position);

        Error.captureStackTrace(this, this.constructor);
        this.character = character;
    }
}