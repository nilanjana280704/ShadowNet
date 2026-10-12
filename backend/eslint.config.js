const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Server boot/shutdown logs go through console by design.
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^next$|^_' }],
    },
  },
  {
    ignores: ['node_modules/', 'coverage/', 'dist/'],
  },
];
