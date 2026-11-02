// Runs the acceptance scenarios through one driver, on any shell (npm uses cmd on Windows,
// which cannot set environment variables inline).
//   node tools/run-acceptance.mjs engine|ui [playwright arguments...]

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const [driver, ...playwrightArguments] = process.argv.slice(2);
if (driver !== 'engine' && driver !== 'ui') {
  console.error('Usage: node tools/run-acceptance.mjs engine|ui [playwright arguments...]');
  process.exit(2);
}

// Run Playwright's CLI with Node directly, so arguments such as -g "spec-001 AC-1]" reach it
// intact instead of being split by a shell.
const playwrightCli = createRequire(import.meta.url).resolve('@playwright/test/cli');
const result = spawnSync(process.execPath, [playwrightCli, 'test', ...playwrightArguments], {
  stdio: 'inherit',
  env: { ...process.env, ACCEPTANCE_DRIVER: driver },
});
process.exit(result.status ?? 1);
