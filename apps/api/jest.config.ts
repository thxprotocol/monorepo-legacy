/* eslint-disable */
export default {
    displayName: 'api',
    preset: '../../jest.preset.js',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html', 'json'],
    setupFilesAfterEnv: ['./src/app/util/jest/setup.ts'],
    coverageDirectory: '../../coverage/apps/api',
    coveragePathIgnorePatterns: ['./src/main.ts'],
    coverageReporters: [['lcov', { projectRoot: './apps/api' }], 'html'],
};
