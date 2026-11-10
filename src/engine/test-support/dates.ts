// For tests only (spec-007 R12): every date of a year as the engine's date text. Written without the
// clock, which the engine may not use.

const DAYS_IN_MONTH: Readonly<Record<string, number>> = {
  '01': 31,
  '02': 28,
  '03': 31,
  '04': 30,
  '05': 31,
  '06': 30,
  '07': 31,
  '08': 31,
  '09': 30,
  '10': 31,
  '11': 30,
  '12': 31,
};

/** Every date of a year that is not a leap year, "2027-01-01" to "2027-12-31". */
export function everyDateOf(year: number): readonly string[] {
  return Object.entries(DAYS_IN_MONTH).flatMap(([month, days]) =>
    Array.from({ length: days }, (_, day) => `${year}-${month}-${String(day + 1).padStart(2, '0')}`),
  );
}
