/* eslint-disable */
export default {
    displayName: 'api',
    preset: '../../jest.preset.js',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html', 'json'],
    coverageDirectory: '../../coverage/apps/api',
};
