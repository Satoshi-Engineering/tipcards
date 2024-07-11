/* eslint-env node */

module.exports = {
  extends: [
    '../.eslintrc.cjs',
  ],
  env: {
    'vue/setup-compiler-macros': true,
    node: true,
    browser: true,
  },
}
