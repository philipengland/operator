import { defineConfig } from 'vitest/config';

const COVERAGE_THRESHOLD_PERCENT = 90;

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'tools/**/*.spec.ts'],
    environment: 'node',
    clearMocks: true,
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['src/engine/**/*.ts', 'src/app/session.ts', 'src/app/labels.ts', 'tools/**/*.ts'],
      exclude: ['**/*.spec.ts', 'src/engine/index.ts', 'src/engine/types.ts', 'tools/run-exceptions-check.ts', 'tools/run-test-results.ts'],
      thresholds: {
        lines: COVERAGE_THRESHOLD_PERCENT,
        branches: COVERAGE_THRESHOLD_PERCENT,
      },
    },
  },
});
