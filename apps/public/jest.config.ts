module.exports = {
    displayName: 'public',
    preset: '../../jest.preset.js',
    transform: {
        '^.+.vue$': '@vue/vue2-jest',
        '.+.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
        '^.+.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'apps/public/tsconfig.spec.json',
            },
        ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'vue', 'js', 'json'],
    coverageDirectory: '../../coverage/apps/public',
    snapshotSerializers: ['jest-serializer-vue'],
    globals: {
        'vue-jest': {
            tsConfig: 'apps/public/tsconfig.spec.json',
        },
    },
};
