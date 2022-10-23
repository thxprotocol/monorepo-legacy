/* eslint-disable */
export default {
    displayName: 'auth',
    preset: '../../jest.preset.js',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html', 'json'],
    coverageReporters: [['lcov', { projectRoot: './apps/auth' }]],
};
