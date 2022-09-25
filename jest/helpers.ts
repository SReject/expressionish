/* eslint @typescript-eslint/no-empty-interface: off, @typescript-eslint/no-namespace: off */
export {}

interface CustomMatchers<R = unknown> {
    toBeAnOperator(): R;
    toHaveOwnProperty(key: string, value?: unknown): R;
    toAsyncThrow(): R;
}

declare global {
    namespace jest {
        interface Expect extends CustomMatchers {}
        interface Matchers<R> extends CustomMatchers<R> {}
        interface InverseAsymmetricMatchers extends CustomMatchers {}
    }
}

interface IResult {
    pass: boolean;
    message: () => string;
}

const hasOwnProperty = Object.prototype.hasOwnProperty

expect.extend({

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    toBeAnOperator: (subject: any) => {
        if (subject == null) {
            return { pass: false, message: () => `expected subject to be an operator definition` };
        }
        if (typeof subject.name !== 'string') {
            return { pass: false, message: () => `name must be a string` }
        }
        if (typeof subject.description !== 'string') {
            return { pass: false, message: () => `description must be a string` }
        }
        if (!Number.isFinite(subject.quantifier)) {
            return { pass: false, message: () => `arguments quantifier must be a numeric value` }
        }
        if (subject.defer != null && typeof subject.defer !== 'boolean') {
            return { pass: false, message: () => `defer must be a boolean value` }
        }
        if (subject.cased != null && typeof subject.cased !== 'boolean') {
            return { pass: false, message: () => `cased must be a boolean value` }
        }
        if (
            !Array.isArray(subject.alias) ||
            subject.alias.some((value: unknown) => typeof value !== 'string')
        ) {
            return { pass: false, message: () => `alias must be a array of strings` }
        }
        if (subject.inverse != null) {
            if (typeof subject.inverse !== 'object') {
                return { pass: false, message: () => `inverse must be an object` }
            }

            const inverse : Record<string, unknown> = subject.inverse;
            if (typeof inverse.description !== 'string') {
                return { pass: false, message: () => `inverse description must be a string` }
            }
            if (
                !Array.isArray(inverse.alias) ||
                inverse.alias.some((value: unknown) => typeof value !== 'string')
            ) {
                return { pass: false, message: () => `inverse alias must be an array of strings` }
            }
            if (
                inverse.handle != null &&
                (
                    typeof inverse.handle !== 'function' ||
                    !(inverse.handle instanceof Function)
                )
            ) {
                return { pass: false, message: () => `inverse handle must be a function`}
            }
        }
        if (
            typeof subject.handle !== 'function' ||
            !(subject.handle instanceof Function)
        ) {
            return { pass: false, message: () => `handle must be a function`}
        }


        return { pass: true, message: () => `expected subject not to be an operator definition` }
    },

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    toHaveOwnProperty: (...args: any[]) : IResult => {

        const [subject, key, value] = args;

        if (!hasOwnProperty.call(subject, key)) {
            return {
                pass: false,
                message: () => `expected subject to have '${key}'`
            };

        } else if (args.length < 3) {
            return {
                pass: true,
                message: () => `expected subject not to have '${key}' as a property`
            };

        } else if (subject[key] === value) {
            return {
                pass: true,
                message: () => `expected subject '${key}' not to equal ${value}`
            };
        } else {
            return {
                pass: false,
                message: () => `expected subject '${key}' to equal ${value}`
            };
        }
    },

    toAsyncThrow: async (subject: () => unknown) : Promise<IResult> => {
        expect.assertions(1);
        try {
            await subject();
            return {
                pass: false,
                message: () => `expected subject to throw an error`
            };
        } catch (err) {
            return {
                pass: true,
                message: () => `subject did not throw an error`
            }
        }
    }
});