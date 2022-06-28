/* eslint-env node */

const INLINE_ELEMENTS = require('eslint-plugin-vue/lib/utils/inline-non-void-elements.json')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
  ],
  env: {
    'vue/setup-compiler-macros': true,
    node: true,
  },
  ignorePatterns: [
    '**/*.min.js',
    '**/*.bundle.js',
    'dist/*',
  ],
  plugins: ['jest'],
  rules: {
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'operator-linebreak': ['error', 'before'],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always',
    }],
    'vue/no-multiple-template-root': 0,
    'vue/max-attributes-per-line': ['warn', {
      singleline: { max: 2 },      
      multiline: { max: 1 },
    }],
    'eol-last': ['error', 'always'],
    'vue/singleline-html-element-content-newline': ['warn', {
      ignoreWhenNoAttributes: true,
      ignoreWhenEmpty: true,
      ignores: ['LinkDefault', ...INLINE_ELEMENTS],
    }],
  },
}
