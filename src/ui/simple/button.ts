// Button (simple component): a real <button>, at least 44 × 44, in four styles
// (docs/contracts/component-library.md). Unavailable buttons stay focusable and ignore presses.

import './button.css';
import { setAttributeOrRemove, writeText, type Component } from '../component';
import { buttonModel, type ButtonProps } from './button.model';

export { buttonModel, type ButtonProps, type ButtonStyle } from './button.model';

/** Simple components are built from the foundations only. */
export const builtFrom: readonly string[] = [];

/** A button; `after` are nodes shown after its label, such as a decorative tick (as Badge). */
export function createButton(props: ButtonProps, onPress?: () => void, after: readonly Node[] = []): Component<ButtonProps> {
  if (props.isReadOnly) {
    return createReadOnlyButton(props);
  }
  const element = document.createElement('button');
  element.type = 'button';
  // A cell's caret relies on an empty button (:empty), so the label only gets its own element when needed.
  const label = after.length > 0 ? document.createElement('span') : element;
  if (label !== element) {
    element.append(label, ...after);
  }
  let current = props;
  element.addEventListener('click', () => {
    if (!buttonModel(current).isUnavailable) {
      onPress?.();
    }
  });
  const update = (next: ButtonProps): void => {
    current = next;
    render(element, label, buttonModel(next));
  };
  update(props);
  return { element, update };
}

/** The same look as a button, but plain text: its name is read out, and nothing can be done with it. */
function createReadOnlyButton(props: ButtonProps): Component<ButtonProps> {
  const element = document.createElement('div');
  const name = document.createElement('span');
  name.className = 'visually-hidden';
  const label = document.createElement('span');
  label.setAttribute('aria-hidden', 'true');
  element.append(name, label);
  const update = (next: ButtonProps): void => {
    const model = buttonModel(next);
    element.className = model.classes.join(' ');
    writeText(name, model.name);
    writeText(label, model.label);
  };
  update(props);
  return { element, update };
}

function render(element: HTMLButtonElement, label: HTMLElement, model: ReturnType<typeof buttonModel>): void {
  element.className = model.classes.join(' ');
  writeText(label, model.label);
  // The visible label is always the start of the name (WCAG 2.5.3, label in name).
  setAttributeOrRemove(element, 'aria-label', model.name === model.label ? null : model.name);
  setAttributeOrRemove(element, 'aria-disabled', model.isUnavailable ? 'true' : null);
  setAttributeOrRemove(element, 'aria-pressed', model.isSelected ? 'true' : null);
}
