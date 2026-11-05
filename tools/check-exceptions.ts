// Baseline 9: every recorded exception has an expiry date, and the pipeline fails once one
// has passed. Today's date is a parameter, so the check itself never reads a clock.

export interface ExceptionRecord {
  readonly id: string;
  readonly reviewBy: string;
  readonly expires: string;
}

/** What is wrong with the recorded exceptions on the given day (YYYY-MM-DD); empty when none. */
export function findExpiryProblems(exceptions: readonly ExceptionRecord[], today: string): readonly string[] {
  void today;
  return exceptions.map((exception) => `${exception.id} expired on ${exception.expires}`);
}
