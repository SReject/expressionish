/* eslint @typescript-eslint/no-empty-interface: off, @typescript-eslint/no-namespace: off */
export {}

interface CustomMatchers<R = unknown> {
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