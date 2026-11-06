// Writes a feature's test-results.md: the evidence that each acceptance criterion passed,
// read from the Playwright and Vitest JSON reports of one run. The Spec Kit Dashboard shows
// this file under Supporting Artifacts and reads its last "OVERALL status:" line.
// No clock and no file access here: the runner (run-test-results.ts) passes everything in.

export type RunName = 'engine' | 'iphone' | 'android' | 'catalogue-iphone' | 'catalogue-android' | 'after-publish' | 'unit';
export type TestStatus = 'passed' | 'failed' | 'skipped';
export type OverallStatus = 'PASS' | 'FAIL' | 'BLOCKED';
type CriterionStatus = 'PASS' | 'FAIL' | 'NOT RUN' | 'NOT COVERED';

export interface TestResult {
  readonly title: string;
  readonly run: RunName;
  readonly status: TestStatus;
}

export interface Coverage {
  readonly lines: number;
  readonly branches: number;
}

export interface TestResultsInput {
  readonly specId: string;
  readonly specMarkdown: string;
  readonly results: readonly TestResult[];
  readonly coverage: Coverage;
  readonly commit: string;
  readonly runDate: string;
  readonly uncommittedChanges?: readonly string[];
  readonly note?: string;
}

const TITLE_SEPARATOR = ' › ';
const NOT_RUN_THERE = '–';

// Columns of the scenario table, in order, with the heading each one shows.
const RUN_COLUMNS: readonly (readonly [RunName, string])[] = [
  ['engine', 'Engine'],
  ['iphone', 'iPhone SE'],
  ['android', 'Pixel 5'],
  ['catalogue-iphone', 'Catalogue iPhone SE'],
  ['catalogue-android', 'Catalogue Pixel 5'],
  ['after-publish', 'Public site'],
  ['unit', 'Unit'],
];

const PLAYWRIGHT_PROJECTS: ReadonlySet<string> = new Set(['engine', 'iphone', 'android', 'catalogue-iphone', 'catalogue-android', 'after-publish']);

// A flaky test passed only on retry, which is never accepted (Playwright standard).
const PLAYWRIGHT_STATUSES: Readonly<Record<string, TestStatus>> = {
  expected: 'passed',
  unexpected: 'failed',
  flaky: 'failed',
  skipped: 'skipped',
};

const VITEST_STATUSES: Readonly<Record<string, TestStatus>> = { passed: 'passed', failed: 'failed' };

/** The feature name from the spec's "# Feature Specification: <name>" heading. */
export function specTitleIn(specMarkdown: string): string {
  return /^# Feature Specification:\s*(.+)$/m.exec(specMarkdown)?.[1]?.trim() ?? 'Untitled';
}

/** Every acceptance criterion the spec defines (written **AC-n**), once each, in number order. */
export function acceptanceCriteriaIn(specMarkdown: string): readonly string[] {
  const numbers = new Set(Array.from(specMarkdown.matchAll(/\*\*AC-(\d+)\*\*/g), (match) => Number(match[1])));
  return [...numbers].sort((first, second) => first - second).map((number) => `AC-${number}`);
}

interface PlaywrightSuite {
  readonly title: string;
  readonly specs?: readonly { readonly title: string; readonly tests: readonly { readonly projectName: string; readonly status: string }[] }[];
  readonly suites?: readonly PlaywrightSuite[];
}

/** Every test in a Playwright JSON report, named by its describe blocks and title. */
export function readPlaywrightReport(report: unknown): readonly TestResult[] {
  // The top-level suites are files; their titles are left out of each test's name.
  return ((report as { suites?: readonly PlaywrightSuite[] }).suites ?? []).flatMap((file) => resultsIn(file, []));
}

function resultsIn(suite: PlaywrightSuite, describeTitles: readonly string[]): readonly TestResult[] {
  const own = (suite.specs ?? []).flatMap((spec) =>
    spec.tests.map((test) => ({
      title: [...describeTitles, spec.title].join(TITLE_SEPARATOR),
      run: playwrightRun(test.projectName),
      status: PLAYWRIGHT_STATUSES[test.status] ?? 'failed',
    })),
  );
  const nested = (suite.suites ?? []).flatMap((child) => resultsIn(child, [...describeTitles, child.title]));
  return [...own, ...nested];
}

function playwrightRun(projectName: string): RunName {
  if (!PLAYWRIGHT_PROJECTS.has(projectName)) {
    throw new Error(`Unknown Playwright project "${projectName}"`);
  }
  return projectName as RunName;
}

interface VitestReport {
  readonly testResults?: readonly {
    readonly assertionResults: readonly { readonly ancestorTitles: readonly string[]; readonly title: string; readonly status: string }[];
  }[];
}

/** Every unit test in a Vitest JSON report, named by its describe blocks and title. */
export function readVitestReport(report: unknown): readonly TestResult[] {
  return ((report as VitestReport).testResults ?? []).flatMap((file) =>
    file.assertionResults.map((assertion) => ({
      title: [...assertion.ancestorTitles, assertion.title].join(TITLE_SEPARATOR),
      run: 'unit' as const,
      status: VITEST_STATUSES[assertion.status] ?? 'skipped',
    })),
  );
}

/** The criteria of this spec a test names, as "[spec-002 AC-1]" or "(spec-002 AC-12)". */
function criteriaNamedBy(title: string, specId: string): readonly string[] {
  return Array.from(title.matchAll(/spec-(\d{3}) AC-(\d+)/g))
    .filter((match) => `spec-${match[1]}` === specId)
    .map((match) => `AC-${match[2]}`);
}

function resultsFor(input: TestResultsInput, criterion: string): readonly TestResult[] {
  return input.results.filter((result) => criteriaNamedBy(result.title, input.specId).includes(criterion));
}

function criterionStatus(results: readonly TestResult[]): CriterionStatus {
  if (results.length === 0) {
    return 'NOT COVERED';
  }
  if (results.some((result) => result.status === 'failed')) {
    return 'FAIL';
  }
  return results.some((result) => result.status === 'passed') ? 'PASS' : 'NOT RUN';
}

/** PASS only when every criterion has passing evidence and nothing for this spec failed. */
export function overallStatus(input: TestResultsInput): OverallStatus {
  const statuses = acceptanceCriteriaIn(input.specMarkdown).map((criterion) => criterionStatus(resultsFor(input, criterion)));
  if (statuses.includes('FAIL')) {
    return 'FAIL';
  }
  return statuses.every((status) => status === 'PASS') ? 'PASS' : 'BLOCKED';
}

/** The whole test-results.md for one spec. */
export function writeTestResults(input: TestResultsInput): string {
  return [
    `# Test Results — ${input.specId} ${specTitleIn(input.specMarkdown)}`,
    '',
    ...(input.note === undefined ? [] : [`> ${input.note}`, '']),
    `- **Spec**: [spec.md](spec.md)`,
    `- **Commit**: \`${input.commit}\``,
    `- **Working tree**: ${workingTree(input.uncommittedChanges ?? [])}`,
    `- **Run on**: ${input.runDate}`,
    `- **Generated by**: \`npm run test-results\` (tools/run-test-results.ts) from this run's reports, not written by hand`,
    '',
    ...criteriaSection(input),
    ...scenarioSection(input),
    ...unitSection(input),
    '## Overall',
    '',
    `OVERALL status: ${overallStatus(input)}`,
    '',
  ].join('\n');
}

function workingTree(uncommittedChanges: readonly string[]): string {
  return uncommittedChanges.length === 0 ? 'clean' : `uncommitted changes to ${uncommittedChanges.map((path) => `\`${path}\``).join(', ')}`;
}

function criteriaSection(input: TestResultsInput): readonly string[] {
  const rows = acceptanceCriteriaIn(input.specMarkdown).map((criterion) => {
    const results = resultsFor(input, criterion);
    const testCount = new Set(results.map((result) => result.title)).size;
    return `| ${criterion} | ${testCount} | ${criterionStatus(results)} |`;
  });
  return ['## Acceptance criteria', '', '| Criterion | Tests | Result |', '| --- | --- | --- |', ...rows, ''];
}

function scenarioSection(input: TestResultsInput): readonly string[] {
  const headings = RUN_COLUMNS.map(([, heading]) => heading).join(' | ');
  const rows = acceptanceCriteriaIn(input.specMarkdown).flatMap((criterion) => {
    const results = resultsFor(input, criterion);
    const titles = [...new Set(results.map((result) => result.title))];
    return titles.map((title) => scenarioRow(criterion, title, results));
  });
  return [
    '## Tests by criterion',
    '',
    `| Criterion | Test | ${headings} |`,
    `| --- | --- | ${RUN_COLUMNS.map(() => '---').join(' | ')} |`,
    ...rows,
    '',
  ];
}

function scenarioRow(criterion: string, title: string, results: readonly TestResult[]): string {
  const cells = RUN_COLUMNS.map(([run]) => cellFor(results.find((result) => result.title === title && result.run === run)));
  const shownTitle = title.replace(/^\[spec-\d{3} AC-\d+\]\s*/, '').replaceAll('|', '\\|');
  return `| ${criterion} | ${shownTitle} | ${cells.join(' | ')} |`;
}

function cellFor(result: TestResult | undefined): string {
  if (result === undefined) {
    return NOT_RUN_THERE;
  }
  return { passed: 'pass', failed: '**FAIL**', skipped: 'skipped' }[result.status];
}

function unitSection(input: TestResultsInput): readonly string[] {
  const units = input.results.filter((result) => result.run === 'unit');
  const passed = units.filter((result) => result.status === 'passed').length;
  const failed = units.filter((result) => result.status === 'failed').length;
  return [
    '## Whole suite',
    '',
    `- **Unit tests**: ${units.length} run, ${passed} passed, ${failed} failed`,
    `- **Coverage**: lines ${input.coverage.lines}%, branches ${input.coverage.branches}%`,
    '',
  ];
}
