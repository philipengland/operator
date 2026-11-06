// Button (simple component): a real <button>, at least 44 × 44, in four styles
// (docs/contracts/component-library.md). Unavailable buttons stay focusable and ignore presses.

import './button.css';
import { writeText, type Component } from '../component';
import { buttonModel, type ButtonProps } from './button.model';

export { buttonModel, type ButtonProps, type ButtonStyle } from './button.model';

/** Simple components are built from the foundations only. */
export const builtFrom: readonly string[] = [];

export function createButton(props: ButtonProps, onPress?: () => void): Component<ButtonProps> {
  const element = document.createElement('button');
  element.type = 'button';
  let current = props;
  element.addEventListener('click', () => {
    if (!buttonModel(current).isUnavailable) {
      onPress?.();
    }
  });
  const update = (next: ButtonProps): void => {
    current = next;
    render(element, buttonModel(next));
  };
  update(props);
  return { element, update };
}

function render(element: HTMLButtonElement, model: ReturnType<typeof buttonModel>): void {
  element.className = model.classes.join(' ');
  writeText(element, model.label);
  // The visible label is always the start of the name (WCAG 2.5.3, label in name).
  setAttributeOrRemove(element, 'aria-label', model.name === model.label ? null : model.name);
  setAttributeOrRemove(element, 'aria-disabled', model.isUnavailable ? 'true' : null);
}

function setAttributeOrRemove(element: Element, name: string, value: string | null): void {
  if (value === null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
}
