export class ExpressionError extends Error {
    public readonly position: number;

    constructor(message: string, position: void | number) {
        super(message);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        this.position = position || 0;
    }
}

export class ExpressionSyntaxError extends ExpressionError {
    public readonly character: string;

    constructor(message: string, position: void | number, character?: string) {
        super(message, position);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        this.character = character || '';
    }
}

export class ExpressionVariableError extends ExpressionError {
    public readonly varname: string;

    constructor(
        message: string,
        position: undefined | number,
        varname?: string
    ) {
        super(message, position);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        this.varname = varname || '';
    }
}

export class ExpressionArgumentsError extends ExpressionError {
    public readonly index: number;
    public readonly varname: undefined | string;

    constructor(
        message: string,
        position: undefined | number,
        varname: undefined | string,
        index?: number
    ) {
        super(message, position);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        this.index = index || -1;
        this.varname = varname;
    }
}