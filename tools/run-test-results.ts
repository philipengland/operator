// Runs every test suite once and writes specs/<feature>/test-results.md for each feature.
//   npm run test-results                                   every feature in specs/
//   npm run test-results -- 003-themed-ui                  one feature
//   npm run test-results -- --public-url https://philipengland.github.io/operator/
//                                                          also run the after-publish checks
//   npm run test-results -- --note "Generated after delivery."
//   npm run test-results -- 004-themed-play-screen --criterion AC-3
//                                                          one criterion, printed for a review checkpoint
// The only place the generator meets the clock, git, files and child processes.
// Exits non-zero unless every feature written is PASS.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { overallStatus, readPlaywrightReport, readVitestReport, writeCriterionReport, writeTestResults, type TestResult, type TestResultsInput } from './test-results.ts';

const SPECS_FOLDER = 'specs';
const FEATURE_FOLDER = /^(\d{3})-.+$/;
// npm scripts run from the repository root.
const VITEST_CLI = 'node_modules/vitest/vitest.mjs';
const VITE_CLI = 'node_modules/vite/bin/vite.js';
const ISO_DATE_LENGTH = 'YYYY-MM-DD'.length;
// git status --porcelain starts each line with two status letters and a space.
const PORCELAIN_STATUS_WIDTH = 'XY '.length;

const { values: options, positionals: requestedFeatures } = parseArgs({
  allowPositionals: true,
  options: { 'public-url': { type: 'string' }, note: { type: 'string' }, criterion: { type: 'string' } },
});

const reports = mkdtempSync(join(tmpdir(), 'operator-test-results-'));

function run(description: string, script: string, args: readonly string[], environment: Record<string, string> = {}): void {
  console.log(`\n▶ ${description}`);
  // A failing suite is recorded as FAIL in the results, so the run carries on.
  spawnSync(process.execPath, [script, ...args], { stdio: 'inherit', env: { ...process.env, ...environment } });
}

function readJson(path: string): unknown {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
}

// With --criterion, only the tests that name it run: "AC-1" must not also match "AC-12".
const criterionFilter = (specId: string, criterion: string): string => `${specId} ${criterion}(?!\\d)`;

function onlyTheCriterion(flag: string): readonly string[] {
  const [folder] = requestedFeatures;
  return options.criterion === undefined || folder === undefined
    ? []
    : [flag, criterionFilter(`spec-${FEATURE_FOLDER.exec(folder)?.[1]}`, options.criterion)];
}

function runUnitTests(): readonly TestResult[] {
  const output = join(reports, 'unit.json');
  run('Unit tests', VITEST_CLI, [
    'run',
    ...onlyTheCriterion('-t'),
    '--coverage',
    '--coverage.reporter=text-summary',
    '--coverage.reporter=json-summary',
    `--coverage.reportsDirectory=${join(reports, 'coverage')}`,
    '--reporter=default',
    '--reporter=json',
    `--outputFile.json=${output}`,
  ]);
  return readVitestReport(readJson(output));
}

function runAcceptance(name: string, driver: string, environment: Record<string, string> = {}): readonly TestResult[] {
  const output = join(reports, `acceptance-${name}.json`);
  run(`Acceptance tests: ${name}`, 'tools/run-acceptance.mjs', [driver, '--reporter=list,json', ...onlyTheCriterion('-g')], {
    ...environment,
    PLAYWRIGHT_JSON_OUTPUT_FILE: output,
  });
  return readPlaywrightReport(readJson(output));
}

function readCoverage(): TestResultsInput['coverage'] {
  const summary = readJson(join(reports, 'coverage', 'coverage-summary.json')) as {
    total?: { lines?: { pct?: number }; branches?: { pct?: number } };
  };
  return { lines: summary.total?.lines?.pct ?? 0, branches: summary.total?.branches?.pct ?? 0 };
}

// Only trailing space is trimmed: a porcelain line can start with a space ( M = changed, unstaged).
function git(...args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trimEnd();
}

// Files that never affect a run: the dashboard's own state and the results being written.
const NOT_PART_OF_THE_RUN = /(\.speckit-board\.json|test-results\.md)$/;

/** Files that differ from the commit, so the record says exactly what was tested. */
function uncommittedChanges(): readonly string[] {
  return git('status', '--porcelain', '--untracked-files=all')
    .split('\n')
    .map((line) => line.slice(PORCELAIN_STATUS_WIDTH).trim())
    .filter((path) => path.length > 0 && !NOT_PART_OF_THE_RUN.test(path));
}

function featuresToWrite(): readonly string[] {
  const all = readdirSync(SPECS_FOLDER).filter((folder) => FEATURE_FOLDER.test(folder) && existsSync(join(SPECS_FOLDER, folder, 'spec.md')));
  return requestedFeatures.length === 0 ? all : all.filter((folder) => requestedFeatures.includes(folder));
}

const unitResults = runUnitTests();
run('Build', VITE_CLI, ['build']);
const results = [
  ...unitResults,
  ...runAcceptance('engine', 'engine'),
  ...runAcceptance('phones', 'ui'),
  ...(options['public-url'] === undefined ? [] : runAcceptance('public site', 'engine', { ACCEPTANCE_PUBLIC_URL: options['public-url'] })),
];

const coverage = readCoverage();
const commit = git('rev-parse', 'HEAD');
const changes = uncommittedChanges();
const runDate = new Date().toISOString().slice(0, ISO_DATE_LENGTH);
let allPass = true;

for (const folder of featuresToWrite()) {
  const input: TestResultsInput = {
    specId: `spec-${FEATURE_FOLDER.exec(folder)?.[1]}`,
    specMarkdown: readFileSync(join(SPECS_FOLDER, folder, 'spec.md'), 'utf8'),
    results,
    coverage,
    commit,
    runDate,
    uncommittedChanges: changes,
    note: options.note,
  };
  if (options.criterion !== undefined) {
    const report = writeCriterionReport(input, options.criterion);
    console.log(`\n${report}`);
    allPass &&= report.includes(`${options.criterion}: PASS`);
    continue;
  }
  const status = overallStatus(input);
  allPass &&= status === 'PASS';
  writeFileSync(join(SPECS_FOLDER, folder, 'test-results.md'), writeTestResults(input));
  console.log(`${folder}: OVERALL status ${status}`);
}

process.exit(allPass ? 0 : 1);
