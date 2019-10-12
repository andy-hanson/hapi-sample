function error(...args) {
  return ["error", ...args]
}

module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'eslint:all'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    "array-element-newline": 0,
    "arrow-parens": error("as-needed"),
    "callback-return": 0,
    "capitalized-comments": 0,
    curly: error("multi"),
    "dot-location": error("property"),
    "func-style": error("declaration"),
    "function-call-argument-newline": 0,
    "function-paren-newline": error("multiline-arguments"),
    "generator-star-spacing": error({ before: false, after: true }),
    "id-length": 0,
    indent: error("tab"),
    "lines-between-class-members": 0,
    "max-classes-per-file": 0,
    "max-lines": 0,
    "max-lines-per-function": 0,
    "max-statements": 0,
    "multiline-comment-style": error("separate-lines"),
    "multiline-ternary": error("always-multiline"),
    "new-cap": 0,
    "newline-per-chained-call": 0,
    "no-await-in-loop": 0,
    "no-confusing-arrow": 0,
    "no-console": 0,
    "no-mixed-operators": 0,
    "no-plusplus": 0,
    "no-process-exit": 0,
    "no-tabs": 0,
    "no-ternary": 0,
    "no-magic-numbers": 0,
    "nonblock-statement-body-position": error("below"),
    "no-else-return": 0,
    "no-negated-condition": 0,
    "no-undefined": 0,
    "no-use-before-define": 0,
    "object-curly-spacing": error("always"),
    "object-property-newline": 0,
    "one-var": 0,
    "padded-blocks": error("never"),
    "require-await": 0,
    "require-unicode-regexp": 0,
    semi: error("never"),
    "sort-imports": 0,
    "space-before-function-paren": 0,
    "sort-keys": 0,
    quotes: error("double"),
    "quote-props": error("as-needed"),

    // TODO: BUG: these conflict with TS constructor properties
    "no-useless-constructor": 0,
    "no-empty-function": 0,

    // TypeScript handles these
    "no-undef": 0,
    "no-unused-vars": 0,
  }
}
