// Text (simple component): words in the display or the body typeface
// (docs/contracts/component-library.md).

import './text.css';
import { writeText, type Component } from '../component';
import { textModel, type TextProps } from './text.model';

export { textModel, type TextProps, type TextStyle } from './text.model';

/** Simple components are built from the foundations only. */
export const builtFrom: readonly string[] = [];

export function createText(props: TextProps): Component<TextProps> {
  const element = document.createElement('span');
  const update = (next: TextProps): void => {
    const model = textModel(next);
    element.className = model.classes.join(' ');
    writeText(element, model.text);
  };
  update(props);
  return { element, update };
}
