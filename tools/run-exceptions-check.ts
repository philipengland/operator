// Runs the Baseline 9 exceptions check on docs/exceptions and fails when any problem is found.
//   npm run exceptions:check
// The only place the check meets the clock: it passes today's date in.

import { findExpiryProblems, readExceptions } from './check-exceptions.ts';

const EXCEPTIONS_FOLDER = 'docs/exceptions';
const ISO_DATE_LENGTH = 'YYYY-MM-DD'.length;

const today = new Date().toISOString().slice(0, ISO_DATE_LENGTH);
const exceptions = readExceptions(EXCEPTIONS_FOLDER);
const problems = findExpiryProblems(exceptions, today);

for (const problem of problems) {
  console.error(problem);
}
console.log(`${exceptions.length} exceptions checked on ${today}; ${problems.length} problems.`);
process.exit(problems.length === 0 ? 0 : 1);
