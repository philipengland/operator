// Keypad (combined component): key Buttons 1 to 9 and a solid Oops Button, in two rows of five
// (docs/contracts/component-library.md). A group named "Keypad".

import './keypad.css';
import type { Component } from '../component';
import { createButton } from '../simple/button';
import { keypadKeys, type KeypadValue } from './keypad.model';

export { keypadKeys, type KeypadKey, type KeypadValue } from './keypad.model';

/** The simple components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Button'];

/** The keypad; `onKey` is called with the digit pressed, or 'clear' for Oops. `update` sets whether the keys are available. */
export function createKeypad(onKey?: (value: KeypadValue) => void, keysAvailable = true): Component<boolean> {
  const element = document.createElement('div');
  element.className = 'keypad';
  element.setAttribute('role', 'group');
  element.setAttribute('aria-label', 'Keypad');
  const keys = keypadKeys(keysAvailable).map((key) => createButton(key.button, () => onKey?.(key.value)));
  element.append(...keys.map((key) => key.element));
  const update = (available: boolean): void => {
    keypadKeys(available).forEach((key, index) => keys[index]?.update(key.button));
  };
  return { element, update };
}
