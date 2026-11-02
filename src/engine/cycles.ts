import type { Digit } from './types';

/** Tapping a cell steps it: empty → 1 → 2 → … (data-model "Cell value cycle"). */
export function nextCellValue(value: Digit | null): Digit | null {
  return ((value ?? 0) + 1) as Digit;
}
