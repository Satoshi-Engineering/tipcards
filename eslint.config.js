import { createRequire } from 'node:module'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import pluginVitest from '@vitest/eslint-plugin'
import pluginCypress from 'eslint-plugin-cypress/flat'

const INLINE_ELEMENTS = createRequire(import.meta.url)('eslint-plugin-vue/lib/utils/inline-non-void-elements.json')

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue,js,jsx,cjs,mjs,cts}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/*.min.js', '**/*.bundle.js', 'dist/*'],
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  {
    ...pluginCypress.configs.recommended,
    files: [
      'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}',
      'cypress/support/**/*.{js,ts,jsx,tsx}',
    ],
  },

  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },

  {
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single', { 'avoidEscape': true }],
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
      curly: ['error', 'all'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'block-spacing': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'no-trailing-spaces': ['error'],
      'indent': ['error', 2, { SwitchCase: 1 }],
    },
  },
]
