import { describe, expect, it } from 'vitest';
import {
  acceptanceCriteriaIn,
  overallStatus,
  readPlaywrightReport,
  readVitestReport,
  specTitleIn,
  writeCriterionReport,
  writeTestResults,
  type TestResult,
  type TestResultsInput,
} from './test-results.ts';

const SPEC = `# Feature Specification: Live Line Calculations

1. **AC-1** — **Given** the game has just opened …
2. **AC-2** — **Given** … see AC-1 again …
3. **AC-10** — **Given** …
`;

function result(title: string, run: TestResult['run'], status: TestResult['status'] = 'passed'): TestResult {
  return { title, run, status };
}

function input(results: readonly TestResult[], overrides: Partial<TestResultsInput> = {}): TestResultsInput {
  return {
    specId: 'spec-002',
    specMarkdown: SPEC,
    results,
    coverage: { lines: 97.5, branches: 93.25 },
    commit: 'abc1234def',
    runDate: '2026-11-06',
    ...overrides,
  };
}

const ALL_PASSING = [
  result('[spec-002 AC-1] opening › shows the working', 'iphone'),
  result('[spec-002 AC-1] opening › shows the working', 'android'),
  result('[spec-002 AC-2] one digit › shows 6 + 2 = 8', 'engine'),
  result('[spec-002 AC-10] division made whole › 6 ÷ 6 = 1', 'engine'),
];

describe('specTitleIn', () => {
  it('reads the feature name from the spec heading', () => {
    expect(specTitleIn(SPEC)).toBe('Live Line Calculations');
  });

  it('falls back to "Untitled" when the spec has no heading', () => {
    expect(specTitleIn('no heading here')).toBe('Untitled');
  });
});

describe('acceptanceCriteriaIn', () => {
  it('lists each bold AC-n once, in number order', () => {
    expect(acceptanceCriteriaIn(SPEC)).toEqual(['AC-1', 'AC-2', 'AC-10']);
  });
});

describe('readPlaywrightReport', () => {
  const report = {
    suites: [
      {
        title: 'play/see-line-working.acceptance-spec.ts',
        specs: [],
        suites: [
          {
            title: '[spec-002 AC-1] opening',
            specs: [
              {
                title: 'shows the working',
                tests: [
                  { projectName: 'iphone', status: 'expected' },
                  { projectName: 'android', status: 'unexpected' },
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'delivery/publish.acceptance-spec.ts',
        specs: [
          {
            title: 'flaky one',
            tests: [
              { projectName: 'engine', status: 'flaky' },
              { projectName: 'after-publish', status: 'skipped' },
            ],
          },
        ],
      },
    ],
  };

  it('names each test by its describe blocks and title, without the file name', () => {
    expect(readPlaywrightReport(report).map((each) => each.title)).toContain('[spec-002 AC-1] opening › shows the working');
  });

  it('records the phone or driver each test ran on and whether it passed', () => {
    expect(readPlaywrightReport(report)).toEqual([
      result('[spec-002 AC-1] opening › shows the working', 'iphone', 'passed'),
      result('[spec-002 AC-1] opening › shows the working', 'android', 'failed'),
      result('flaky one', 'engine', 'failed'),
      result('flaky one', 'after-publish', 'skipped'),
    ]);
  });

  it('counts a flaky test as failed, since a scenario that passes only on retry is never accepted', () => {
    expect(readPlaywrightReport(report).find((each) => each.title === 'flaky one' && each.run === 'engine')?.status).toBe('failed');
  });

  it('records the catalogue phones (spec-003) as runs of their own', () => {
    const catalogue = {
      suites: [
        {
          title: 'library/simple-components.acceptance-spec.ts',
          specs: [{ title: 't', tests: [{ projectName: 'catalogue-iphone', status: 'expected' }, { projectName: 'catalogue-android', status: 'expected' }] }],
        },
      ],
    };
    expect(readPlaywrightReport(catalogue).map((each) => each.run)).toEqual(['catalogue-iphone', 'catalogue-android']);
  });

  it('counts the speed budget, which runs alone on the Pixel 5, as a Pixel 5 run', () => {
    const speed = {
      suites: [{ title: 'play/play-on-a-phone.acceptance-spec.ts', specs: [{ title: 't', tests: [{ projectName: 'android-speed', status: 'expected' }] }] }],
    };

    expect(readPlaywrightReport(speed).map((each) => each.run)).toEqual(['android']);
  });

  it.each([
    ['iphone-flagged', 'iphone'],
    ['android-flagged', 'android'],
  ] as const)('counts %s, the same phone on the flags-on build, as a run on %s', (projectName, run) => {
    const flagged = { suites: [{ title: 'play/keypad.acceptance-spec.ts', specs: [{ title: 't', tests: [{ projectName, status: 'expected' }] }] }] };

    expect(readPlaywrightReport(flagged).map((each) => each.run)).toEqual([run]);
  });

  it('rejects a project it does not know, rather than guessing where the test ran', () => {
    const unknown = { suites: [{ title: 'x', specs: [{ title: 't', tests: [{ projectName: 'desktop', status: 'expected' }] }] }] };
    expect(() => readPlaywrightReport(unknown)).toThrow('Unknown Playwright project "desktop"');
  });
});

describe('readVitestReport', () => {
  const report = {
    testResults: [
      {
        assertionResults: [
          { ancestorTitles: ['line working', 'a negative target (spec-002 AC-12)'], title: 'meets −3 with 6 − 9', status: 'passed' },
          { ancestorTitles: [], title: 'fails', status: 'failed' },
          { ancestorTitles: ['later'], title: 'todo', status: 'todo' },
        ],
      },
    ],
  };

  it('records every unit test as a unit result, named by its describe blocks and title', () => {
    expect(readVitestReport(report)).toEqual([
      result('line working › a negative target (spec-002 AC-12) › meets −3 with 6 − 9', 'unit', 'passed'),
      result('fails', 'unit', 'failed'),
      result('later › todo', 'unit', 'skipped'),
    ]);
  });
});

describe('overallStatus', () => {
  it('is PASS when every criterion has a passing test and nothing failed', () => {
    expect(overallStatus(input(ALL_PASSING))).toBe('PASS');
  });

  it('is FAIL when any test for the spec failed', () => {
    expect(overallStatus(input([...ALL_PASSING, result('[spec-002 AC-2] one digit › shows 6 + 2 = 8', 'android', 'failed')]))).toBe('FAIL');
  });

  it('is BLOCKED when a criterion has no passing test', () => {
    expect(overallStatus(input(ALL_PASSING.filter((each) => !each.title.includes('AC-10'))))).toBe('BLOCKED');
  });

  it('is BLOCKED when a criterion was only skipped', () => {
    const skipped = ALL_PASSING.map((each) => (each.title.includes('AC-10') ? { ...each, status: 'skipped' as const } : each));
    expect(overallStatus(input(skipped))).toBe('BLOCKED');
  });

  it('ignores tests that belong to another spec', () => {
    expect(overallStatus(input([...ALL_PASSING, result('[spec-001 AC-1] other spec', 'engine', 'failed')]))).toBe('PASS');
  });

  it('counts a unit test that names the criterion, without brackets, as evidence', () => {
    const viaUnit = [...ALL_PASSING.filter((each) => !each.title.includes('AC-10')), result('division (spec-002 AC-10)', 'unit')];
    expect(overallStatus(input(viaUnit))).toBe('PASS');
  });

  // This title must not itself name a criterion, or it would be counted as evidence for one.
  it('does not count evidence for AC-1 towards AC-10, whose number starts the same', () => {
    const onlyAc1 = [result('[spec-002 AC-1] a', 'engine'), result('[spec-002 AC-2] b', 'engine')];
    expect(overallStatus(input(onlyAc1))).toBe('BLOCKED');
  });
});

describe('writeTestResults', () => {
  const markdown = writeTestResults(input(ALL_PASSING));

  it('heads the file with the spec and its feature name', () => {
    expect(markdown).toMatch(/^# Test Results — spec-002 Live Line Calculations\n/);
  });

  it('states the commit and the date of the run', () => {
    expect(markdown).toContain('- **Commit**: `abc1234def`');
    expect(markdown).toContain('- **Run on**: 2026-11-06');
  });

  it('shows one row per scenario with its result on each driver and phone', () => {
    expect(markdown).toContain('| AC-1 | opening › shows the working | – | pass | pass | – | – |');
  });

  it('shows catalogue results in their own columns, after the game\'s phones', () => {
    const fromCatalogue = writeTestResults(input([...ALL_PASSING, result('[spec-002 AC-1] catalogue › sample', 'catalogue-android')]));
    expect(fromCatalogue).toContain('| Criterion | Test | Engine | iPhone SE | Pixel 5 | Catalogue iPhone SE | Catalogue Pixel 5 | Public site | Unit |');
    expect(fromCatalogue).toContain('| AC-1 | catalogue › sample | – | – | – | – | pass | – | – |');
  });

  it('summarises each criterion', () => {
    expect(markdown).toContain('| AC-10 | 1 | PASS |');
  });

  it('lists a criterion with no tests as not covered', () => {
    const missing = writeTestResults(input(ALL_PASSING.filter((each) => !each.title.includes('AC-10'))));
    expect(missing).toContain('| AC-10 | 0 | NOT COVERED |');
  });

  it('reports unit test totals and coverage', () => {
    const withUnits = writeTestResults(input([...ALL_PASSING, result('a', 'unit'), result('b', 'unit', 'failed')]));
    expect(withUnits).toContain('- **Unit tests**: 2 run, 1 passed, 1 failed');
    expect(withUnits).toContain('- **Coverage**: lines 97.5%, branches 93.25%');
  });

  it('says the working tree was clean when nothing was uncommitted', () => {
    expect(markdown).toContain('- **Working tree**: clean');
  });

  it('lists uncommitted changes, so the record says exactly what was tested', () => {
    const dirty = writeTestResults(input(ALL_PASSING, { uncommittedChanges: ['tools/run-test-results.ts', 'package.json'] }));
    expect(dirty).toContain('- **Working tree**: uncommitted changes to `tools/run-test-results.ts`, `package.json`');
  });

  it('includes a note when one is given', () => {
    expect(writeTestResults(input(ALL_PASSING, { note: 'Generated after delivery.' }))).toContain('> Generated after delivery.');
  });

  it('ends with exactly one overall status line the dashboard can read', () => {
    expect(markdown.match(/OVERALL status/g)).toHaveLength(1);
    expect(markdown.trimEnd().endsWith('OVERALL status: PASS')).toBe(true);
  });
});

describe('writeCriterionReport', () => {
  it('says NOT COVERED for a criterion no test names, so a gap cannot look fine', () => {
    expect(writeCriterionReport(input(ALL_PASSING), 'AC-99')).toContain('AC-99: NOT COVERED');
  });

  it('shows each test that names the criterion, with its result on each run, and no other', () => {
    const report = writeCriterionReport(input(ALL_PASSING), 'AC-1');

    expect(report).toContain('AC-1: PASS');
    expect(report).toContain('| AC-1 | opening › shows the working | – | pass | pass | – | – | – | – |');
    expect(report).not.toContain('AC-2');
  });
});
