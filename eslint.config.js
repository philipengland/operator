import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const ENGINE_FILES = ['src/engine/**/*.ts'];
const NO_PACKAGES = { regex: '^(?!\\.{1,2}/)', message: 'The engine imports no packages (constitution II).' };

// A file may climb with ../ only as far as src/engine, so the limit depends on its depth.
function engineFolderLimit(depth) {
  const files = depth === 0 ? ['src/engine/*.ts'] : [`src/engine/${'*/'.repeat(depth)}*.ts`];
  return {
    files,
    ignores: ['src/engine/**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            NO_PACKAGES,
            { regex: `^(\\.\\./){${depth + 1},}`, message: 'The engine imports nothing outside src/engine (constitution II).' },
          ],
        },
      ],
    },
  };
}

// spec-003 research R2: the component library's tiers. Each tier may import only from the tiers
// below it, and nothing in src/ui/ may import a package, the engine or the app (FR-301 to FR-305).
const NO_PACKAGES_IN_UI = { regex: '^(?!\\.{1,2}/)', message: 'The component library imports no packages (ADR 0002).' };
const LEAVES_THE_LIBRARY = { regex: '^(\\.\\./){2,}', message: 'Nothing in src/ui/ imports the engine or the app (FR-305).' };

function uiTier(folder, allowedParents, message) {
  return {
    files: [`src/ui/${folder}/**/*.ts`],
    ignores: ['src/ui/**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            NO_PACKAGES_IN_UI,
            LEAVES_THE_LIBRARY,
            { regex: `^\\.\\./(?!(${allowedParents.join('|')})(/|$))`, message },
          ],
        },
      ],
    },
  };
}

const UI_TIERS = [
  {
    files: ['src/ui/*.ts'],
    ignores: ['src/ui/**/*.spec.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [NO_PACKAGES_IN_UI, { regex: '^\\.\\./', message: LEAVES_THE_LIBRARY.message }] }],
    },
  },
  uiTier('foundations', [], 'Foundations import no other tier (research R2).'),
  uiTier('simple', ['foundations', 'component'], 'Simple components import only the foundations (FR-302).'),
  uiTier('combined', ['simple', 'combined', 'foundations', 'component'], 'Combined components are built only from simple and combined components (FR-303).'),
  uiTier('screens', ['combined', 'simple/button', 'foundations', 'component'], 'Screens are built only from combined components and the main button (FR-304).'),
];

export default tseslint.config(
  {
    ignores: ['dist/', 'catalogue-dist/', 'coverage/', 'test-results/', 'playwright-report/', 'node_modules/'],
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
    // Tests state concrete examples, config files state limits and puzzle files state puzzle
    // data, so literal numbers are expected there.
    files: ['**/*.spec.ts', 'test/**/*.ts', '*.config.{js,ts}', 'src/engine/puzzles/**/*.ts'],
    rules: { '@typescript-eslint/no-magic-numbers': 'off' },
  },
  {
    // Constitution II and III: the engine imports nothing outside itself, uses no browser
    // globals, and has no source of non-determinism.
    files: ENGINE_FILES,
    ignores: ['src/engine/**/*.spec.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [NO_PACKAGES] }],
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
  engineFolderLimit(0),
  engineFolderLimit(1),
  engineFolderLimit(2),
  ...UI_TIERS,
);
