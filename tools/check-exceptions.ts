import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

// Baseline 9: every recorded exception has an expiry date, and the pipeline fails once one
// has passed. Today's date is a parameter, so the check itself never reads a clock.

const EXCEPTION_FILE = /^EXC-.*\.md$/;
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

export interface ExceptionRecord {
  readonly id: string;
  readonly reviewBy: string;
  readonly expires: string;
}

/** The front matter of every exception record (EXC-*.md) in a folder. */
export function readExceptions(folder: string): readonly ExceptionRecord[] {
  return readdirSync(folder)
    .filter((file) => EXCEPTION_FILE.test(file))
    .map((file) => {
      const frontMatter = parse(readFileSync(join(folder, file), 'utf8').match(FRONT_MATTER)?.[1] ?? '') as Record<string, unknown>;
      return { id: String(frontMatter.id), reviewBy: String(frontMatter.review_by), expires: String(frontMatter.expires) };
    });
}

/** What is wrong with the recorded exceptions on the given day (YYYY-MM-DD); empty when none. */
export function findExpiryProblems(exceptions: readonly ExceptionRecord[], today: string): readonly string[] {
  return exceptions.flatMap((exception) => problemsWith(exception, today));
}

// ISO dates (YYYY-MM-DD) sort as plain text.
function problemsWith({ id, reviewBy, expires }: ExceptionRecord, today: string): readonly string[] {
  const problems: string[] = [];
  if (expires < today) {
    problems.push(`${id} expired on ${expires}`);
  }
  if (reviewBy > expires) {
    problems.push(`${id} is reviewed on ${reviewBy}, after it expires on ${expires}`);
  }
  return problems;
}
