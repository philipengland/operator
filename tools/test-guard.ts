// Protects existing unit tests: every line removed from a test file that already exists must be
// explained by a new row in specs/<feature>/test-changes.md (AGENTS.md). Pure; run-test-guard.ts feeds it.

const TEST_FILE = /^(src|tools)\/.+\.spec\.ts$/;
const RECORD_FILE = /^specs\/[^/]+\/test-changes\.md$/;
const REQUIREMENT = /\b(?:FR-|AC-|SC-|T)\d+\b/;
// Splitting on | leaves an empty first cell, so the columns start at 1.
const FILE_COLUMN = 1;
const REQUIREMENT_COLUMN = 3;
const WHY_COLUMN = 4;

export interface TestChange {
  readonly file: string;
  readonly removedLines: readonly string[];
  readonly isRecorded: boolean;
}

/** The existing test files a `git diff` changes, and whether each change has been explained. */
export function changedExistingTests(diff: string): readonly TestChange[] {
  const sections = sectionsOf(diff);
  const rows = sections.filter(({ file }) => RECORD_FILE.test(file)).flatMap(({ addedLines }) => addedLines.filter(explainsAChange));
  return sections
    .filter(({ file, removedLines }) => TEST_FILE.test(file) && removedLines.length > 0)
    .map(({ file, removedLines }) => ({ file, removedLines, isRecorded: rows.some((row) => recordedFile(row) === file) }));
}

interface FileDiff {
  readonly file: string;
  readonly removedLines: readonly string[];
  readonly addedLines: readonly string[];
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
      const addedLines = changes.filter((line) => line.startsWith('+')).map((line) => line.slice(1));
      return { file: header.slice(header.indexOf(' b/') + ' b/'.length), removedLines, addedLines };
    });
}

/** A row of the record: | `file` | test | requirement | why |. */
function explainsAChange(row: string): boolean {
  const cells = row.split('|').map((cell) => cell.trim());
  return REQUIREMENT.test(cells[REQUIREMENT_COLUMN] ?? '') && (cells[WHY_COLUMN] ?? '') !== '';
}

function recordedFile(row: string): string {
  return (row.split('|')[FILE_COLUMN] ?? '').replaceAll('`', '').trim();
}
