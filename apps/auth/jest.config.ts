/* eslint-disable */
export default {
    displayName: 'auth',
    preset: '../../jest.preset.js',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html', 'json'],
    coverageDirectory: '../../coverage/apps/api',
    coverageReporters: [['lcov', { projectRoot: './apps/auth' }]],
};
