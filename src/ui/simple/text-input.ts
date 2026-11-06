// Text input (simple component): a visible label, then a field on the paper colour whose typed text
// is in the display typeface (docs/contracts/component-library.md).

import './text-input.css';
import { writeText, type Component } from '../component';
import { textInputModel, type TextInputProps } from './text-input.model';

export { textInputModel, type TextInputProps } from './text-input.model';

/** Simple components are built from the foundations only. */
export const builtFrom: readonly string[] = [];

export function createTextInput(props: TextInputProps): Component<TextInputProps> {
  const element = document.createElement('div');
  element.className = 'text-input';
  const label = document.createElement('label');
  const field = document.createElement('input');
  field.type = 'text';
  field.autocomplete = 'off';
  field.spellcheck = false;
  element.append(label, field);
  const update = (next: TextInputProps): void => {
    const model = textInputModel(next);
    writeText(label, model.label);
    label.htmlFor = model.fieldId;
    field.id = model.fieldId;
    field.placeholder = model.hint;
  };
  update(props);
  return { element, update };
}
