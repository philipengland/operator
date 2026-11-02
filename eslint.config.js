import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const ENGINE_FILES = ['src/engine/**/*.ts'];

export default tseslint.config(
  {
    ignores: ['dist/', 'coverage/', 'test-results/', 'playwright-report/', 'node_modules/'],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    // Coding principles: method complexity, parameters, nesting and named values.
    rules: {
      complexity: ['error', 10],
      'max-params': ['error', 6],
      'max-depth': ['error', 3],
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': [
        'error',
        { ignore: [0, 1, -1, 2], ignoreArrayIndexes: true, ignoreDefaultValues: true, ignoreNumericLiteralTypes: true },
      ],
    },
  },
  {
    // Plain JavaScript tools and config files run in Node.
    files: ['**/*.{js,mjs}'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
  {
    // Playwright fixtures must take an object pattern first, even when they need nothing.
    rules: { 'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }] },
  },
  {
    // Tests state concrete examples and config files state limits, so literal numbers are
    // expected there.
    files: ['**/*.spec.ts', 'test/**/*.ts', '*.config.{js,ts}'],
    rules: { '@typescript-eslint/no-magic-numbers': 'off' },
  },
  {
    // Constitution II and III: the engine imports nothing outside itself, uses no browser
    // globals, and has no source of non-determinism.
    files: ENGINE_FILES,
    ignores: ['src/engine/**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { regex: '^(?!\\.{1,2}/)', message: 'The engine imports no packages (constitution II).' },
            { regex: '^\\.\\./\\.\\./', message: 'The engine imports nothing outside src/engine (constitution II).' },
            { regex: '^\\.\\./(?!engine/)', message: 'The engine imports nothing outside src/engine (constitution II).' },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        ...['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'fetch', 'setTimeout', 'setInterval', 'Date', 'performance', 'crypto', 'process'].map(
          (name) => ({ name, message: 'The engine is pure: no browser, Node, clock or timer globals (constitution II and III).' }),
        ),
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'All randomness comes from the seeded generator (constitution III).' },
      ],
    },
  },
);
