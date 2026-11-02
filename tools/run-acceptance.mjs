// Runs the acceptance scenarios through one driver, on any shell (npm uses cmd on Windows,
// which cannot set environment variables inline).
//   node tools/run-acceptance.mjs engine|ui [playwright arguments...]

import { spawnSync } from 'node:child_process';

const [driver, ...playwrightArguments] = process.argv.slice(2);
if (driver !== 'engine' && driver !== 'ui') {
  console.error('Usage: node tools/run-acceptance.mjs engine|ui [playwright arguments...]');
  process.exit(2);
}

const result = spawnSync('npx', ['playwright', 'test', ...playwrightArguments], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, ACCEPTANCE_DRIVER: driver },
});
process.exit(result.status ?? 1);
