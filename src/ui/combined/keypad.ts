// Keypad (combined component): key Buttons 1 to 9 and a solid Oops Button, in two rows of five
// (docs/contracts/component-library.md). A group named "Keypad".

import './keypad.css';
import type { Component } from '../component';
import { createButton } from '../simple/button';
import { keypadKeys, type KeypadValue } from './keypad.model';

export { keypadKeys, type KeypadKey, type KeypadValue } from './keypad.model';

/** The simple components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Button'];

/** The keypad; `onKey` is called with the digit pressed, or 'clear' for Oops. */
export function createKeypad(onKey?: (value: KeypadValue) => void): Component<void> {
  const element = document.createElement('div');
  element.className = 'keypad';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', 'Keypad');
  element.append(...keypadKeys().map((key) => createButton(key.button, () => onKey?.(key.value)).element));
  return { element, update: () => undefined };
}
