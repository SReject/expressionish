/* eslint @typescript-eslint/no-empty-interface: off, @typescript-eslint/no-namespace: off */
export {}

interface CustomMatchers<R = unknown> {
    hasProperty(key: string): R;
    toAsyncThrow(): R;
}

declare global {
    namespace jest {
        interface Expect extends CustomMatchers {}
        interface Matchers<R> extends CustomMatchers<R> {}
        interface InverseAsymmetricMatchers extends CustomMatchers {}
    }
}

const hasOwnProperty = Object.prototype.hasOwnProperty

expect.extend({
    hasProperty: (subject: unknown, key: string) : {pass: boolean, message: () => string} => {
        if (hasOwnProperty.call(subject, key)) {
            return {
                pass: true,
                message: () => `expected subject not to have '${key}' as a property`
            };
        }
        return {
            pass: false,
            message: () => `expected subject to have '${key}' as a property`
        }
    },

    toAsyncThrow: async (subject: () => unknown) : Promise<{ pass: boolean, message: () => string}> => {
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