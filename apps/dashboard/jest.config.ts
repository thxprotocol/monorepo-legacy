module.exports = {
    displayName: 'dashboard',
    preset: '../../jest.preset.js',
    transform: {
        '^.+.vue$': '@vue/vue2-jest',
        '.+.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
        '^.+.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'apps/dashboard/tsconfig.spec.json',
            },
        ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'vue', 'js', 'json'],
    coverageDirectory: '../../coverage/apps/dashboard',
    snapshotSerializers: ['jest-serializer-vue'],
    globals: {
        'vue-jest': {
            tsConfig: 'apps/dashboard/tsconfig.spec.json',
        },
    },
};
