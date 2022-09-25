/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '\\.ts$': [
            'ts-jest',
            {
                tsconfig: "./tsconfig.json"
            }
        ]
    },
    collectCoverageFrom: [
        "src/**/*{!(.spec),}.ts"
    ],
    coverageReporters: ['lcov']
};