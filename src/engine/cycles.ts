import type { Digit } from './types';

const HIGHEST_DIGIT: Digit = 9;

/** Tapping a cell steps it: empty → 1 → 2 → … → 9 → empty (data-model "Cell value cycle"). */
export function nextCellValue(value: Digit | null): Digit | null {
  if (value === HIGHEST_DIGIT) {
    return null;
  }
  return ((value ?? 0) + 1) as Digit;
}
