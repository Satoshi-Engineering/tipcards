/* eslint-env node */

module.exports = {
  extends: [
    '../.eslintrc.js',
  ],
  env: {
    'vue/setup-compiler-macros': true,
    node: true,
    browser: true,
  },
}
