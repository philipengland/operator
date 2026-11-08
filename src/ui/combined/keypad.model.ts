// Keypad (combined component): digit keys 1 to 9 and a solid Oops key that clears the cell, in
// two rows of five (spec-003 FR-319; docs/contracts/component-library.md).

import type { ButtonProps } from '../simple/button.model';

/** What a key enters: a digit, or clearing the selected cell. */
export type KeypadValue = number | 'clear';

export interface KeypadKey {
  readonly value: KeypadValue;
  readonly button: ButtonProps;
}

// A cell holds 1 to 9 (spec-001).
const LARGEST_DIGIT = 9;
const DIGITS = Array.from({ length: LARGEST_DIGIT }, (_, index) => index + 1);

const CLEAR_KEY: KeypadKey = { value: 'clear', button: { label: 'Oops', style: 'solid', action: 'clear cell' } };

/** The keys in order; while the keys are not available, each is shown and heard as unavailable (spec-004 FR-405). */
export function keypadKeys(keysAvailable = true): readonly KeypadKey[] {
  const keys = [...DIGITS.map((digit): KeypadKey => ({ value: digit, button: { label: String(digit), style: 'key' } })), CLEAR_KEY];
  return keysAvailable ? keys : keys.map((key) => ({ ...key, button: { ...key.button, isUnavailable: true } }));
}
