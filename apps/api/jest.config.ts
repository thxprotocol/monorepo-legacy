/* eslint-disable */
export default {
    displayName: 'api',
    preset: '../../jest.preset.js',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html', 'json'],
    coverageReporters: [['lcov', { projectRoot: './apps/api' }]],
};
