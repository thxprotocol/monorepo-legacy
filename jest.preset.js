const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
    ...nxPreset,
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.base.json',
            },
        ],
    },
};
