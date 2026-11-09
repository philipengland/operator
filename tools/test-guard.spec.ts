import { describe, expect, it } from 'vitest';
import { changedExistingTests } from './test-guard.ts';

const TEST_FILE = 'src/app/session.spec.ts';

/** One file's section of a `git diff`, with these changed lines. */
function diffOf(file: string, ...changedLines: readonly string[]): string {
  return [`diff --git a/${file} b/${file}`, `--- a/${file}`, `+++ b/${file}`, '@@ -1,2 +1,2 @@', ...changedLines].join('\n') + '\n';
}

const RECORD = 'specs/006-solution-log/test-changes.md';
const row = (file: string, requirement: string, why: string): string => `+| \`${file}\` | counts a repeat once | ${requirement} | ${why} |`;

const REMOVED = diffOf(TEST_FILE, "-  it('counts a repeat once', () => {");

describe('changedExistingTests', () => {
  it('reports a line removed from an existing test, unexplained', () => {
    expect(changedExistingTests(REMOVED)).toEqual([
      { file: TEST_FILE, removedLines: ["  it('counts a repeat once', () => {"], isRecorded: false },
    ]);
  });

  it('allows a test file that only gained lines', () => {
    expect(changedExistingTests(diffOf(TEST_FILE, "+  it('counts a new thing', () => {"))).toEqual([]);
  });

  it('ignores a removed blank line', () => {
    expect(changedExistingTests(diffOf(TEST_FILE, '-   '))).toEqual([]);
  });

  it('looks only at unit test files', () => {
    expect(changedExistingTests(diffOf('src/app/session.ts', '-  return state;'))).toEqual([]);
  });

  it('accepts a change explained by a new row in the record', () => {
    const explained = REMOVED + diffOf(RECORD, row(TEST_FILE, 'spec-006 FR-601', 'The counter now opens the list.'));

    expect(changedExistingTests(explained)[0]?.isRecorded).toBe(true);
  });

  it('does not accept a row that names no requirement', () => {
    const unexplained = REMOVED + diffOf(RECORD, row(TEST_FILE, 'tidying', 'It looked untidy.'));

    expect(changedExistingTests(unexplained)[0]?.isRecorded).toBe(false);
  });
});
