/* eslint @typescript-eslint/no-empty-interface: off, @typescript-eslint/no-namespace: off */
export {}

interface CustomMatchers<R = unknown> {
    hasProperty(key: string): R;
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
    }
});