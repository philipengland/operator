// Baseline 9: every recorded exception has an expiry date, and the pipeline fails once one
// has passed. Today's date is a parameter, so the check itself never reads a clock.

export interface ExceptionRecord {
  readonly id: string;
  readonly reviewBy: string;
  readonly expires: string;
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
