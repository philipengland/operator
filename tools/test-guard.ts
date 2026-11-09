// Protects existing unit tests: every line removed from a test file that already exists must be
// explained by a new row in specs/<feature>/test-changes.md (AGENTS.md). Pure; run-test-guard.ts feeds it.

export interface TestChange {
  readonly file: string;
  readonly removedLines: readonly string[];
  readonly isRecorded: boolean;
}

/** The existing test files a `git diff` changes, and whether each change has been explained. */
export function changedExistingTests(diff: string): readonly TestChange[] {
  return sectionsOf(diff).filter(({ removedLines }) => removedLines.length > 0).map(({ file, removedLines }) => ({ file, removedLines, isRecorded: false }));
}

interface FileDiff {
  readonly file: string;
  readonly removedLines: readonly string[];
}

/** One entry per file in the diff. Only lines after the first @@ are changes; before it are headers. */
function sectionsOf(diff: string): readonly FileDiff[] {
  return diff
    .split(/^diff --git /m)
    .slice(1)
    .map((section) => {
      const [header = '', ...lines] = section.split(/\r?\n/);
      const firstHunk = lines.findIndex((line) => line.startsWith('@@'));
      const changes = firstHunk < 0 ? [] : lines.slice(firstHunk);
      const removedLines = changes.filter((line) => line.startsWith('-') && line.slice(1).trim() !== '').map((line) => line.slice(1));
      return { file: header.slice(header.indexOf(' b/') + ' b/'.length), removedLines };
    });
}
