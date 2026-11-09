// Fails when an existing unit test was changed or deleted with no recorded reason (AGENTS.md).
//   npm run tests:guard                compares this branch with origin/main
// The pipeline passes the pull request's base commit in TEST_GUARD_BASE.

import { execFileSync } from 'node:child_process';
import { changedExistingTests } from './test-guard.ts';

const BASE = process.env.TEST_GUARD_BASE ?? 'origin/main';
const LARGEST_DIFF_IN_BYTES = 64 * 1024 * 1024;
const WATCHED = [':(glob)src/**/*.spec.ts', ':(glob)tools/**/*.spec.ts', ':(glob)specs/*/test-changes.md'];

const diff = execFileSync('git', ['diff', '-w', '--no-renames', `${BASE}...HEAD`, '--', ...WATCHED], {
  encoding: 'utf8',
  maxBuffer: LARGEST_DIFF_IN_BYTES,
});
const changes = changedExistingTests(diff);
const unexplained = changes.filter((change) => !change.isRecorded);

for (const { file, removedLines, isRecorded } of changes) {
  console.log(`${isRecorded ? 'Recorded' : 'NOT RECORDED'}: ${file}`);
  removedLines.forEach((line) => console.log(`  - ${line.trim()}`));
}
console.log(`${changes.length} existing test files changed; ${unexplained.length} without a recorded reason.`);
if (unexplained.length > 0) {
  console.error('An existing unit test may change only when a specific change in functionality makes it obsolete.');
  console.error('If one has, add a row to specs/<feature>/test-changes.md:');
  console.error('| File | Test | Requirement (FR-, AC-, SC- or task) | Why the test is obsolete |');
}
process.exit(unexplained.length === 0 ? 0 : 1);
