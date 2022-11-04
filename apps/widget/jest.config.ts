module.exports = {
    displayName: 'widget',
    preset: '../../jest.preset.js',
    transform: {
        '^.+.vue$': 'vue3-jest',
        '.+.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
        '^.+.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'vue', 'js', 'json'],
    coverageDirectory: '../../coverage/apps/widget',
    snapshotSerializers: ['jest-serializer-vue'],
    globals: {
        'ts-jest': {
            tsconfig: 'apps/widget/tsconfig.spec.json',
            babelConfig: 'apps/widget/babel.config.js',
        },
        'vue-jest': {
            tsConfig: 'apps/widget/tsconfig.spec.json',
            babelConfig: 'apps/widget/babel.config.js',
        },
    },
};
