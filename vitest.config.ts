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
      // spec-003: the component library's pure parts. Renderers (src/ui/**/<name>.ts) need a DOM and
      // are proven through the catalogue on the phones (ADR 0002), so only models, foundations and
      // component.ts count here.
      include: [
        'src/engine/**/*.ts',
        'src/app/session.ts',
        'src/app/labels.ts',
        'src/ui/component.ts',
        'src/ui/foundations/**/*.ts',
        'src/ui/**/*.model.ts',
        'tools/**/*.ts',
      ],
      exclude: ['**/*.spec.ts', 'src/engine/index.ts', 'src/engine/types.ts', 'tools/run-exceptions-check.ts', 'tools/run-test-results.ts'],
      thresholds: {
        lines: COVERAGE_THRESHOLD_PERCENT,
        branches: COVERAGE_THRESHOLD_PERCENT,
      },
    },
  },
});
