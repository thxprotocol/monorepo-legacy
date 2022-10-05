module.exports = {
  displayName: 'wallet',
  preset: '../../jest.preset.js',
  transform: {
    '^.+.vue$': '@vue/vue2-jest',
    '.+.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '^.+.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'vue', 'js', 'json'],
  coverageDirectory: '../../coverage/apps/wallet',
  snapshotSerializers: ['jest-serializer-vue'],
  globals: {
    'ts-jest': {
      tsconfig: 'apps/wallet/tsconfig.spec.json',
      babelConfig: 'apps/wallet/babel.config.js',
    },
    'vue-jest': {
      tsConfig: 'apps/wallet/tsconfig.spec.json',
      babelConfig: 'apps/wallet/babel.config.js',
    },
  },
};
