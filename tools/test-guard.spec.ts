import { describe, expect, it } from 'vitest';
import { changedExistingTests } from './test-guard.ts';

const TEST_FILE = 'src/app/session.spec.ts';

/** One file's section of a `git diff`, with these changed lines. */
function diffOf(file: string, ...changedLines: readonly string[]): string {
  return [`diff --git a/${file} b/${file}`, `--- a/${file}`, `+++ b/${file}`, '@@ -1,2 +1,2 @@', ...changedLines].join('\n') + '\n';
}

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
});
