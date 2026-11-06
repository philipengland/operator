// Badge (simple component): an ink pill for short text, heard as its text
// (docs/contracts/component-library.md).

import './badge.css';
import { writeText, type Component } from '../component';
import { badgeModel, type BadgeProps } from './badge.model';

export { badgeModel, type BadgeProps, type BadgeStyle } from './badge.model';

/** Simple components are built from the foundations only. */
export const builtFrom: readonly string[] = [];

export function createBadge(props: BadgeProps, after: readonly Node[] = []): Component<BadgeProps> {
  const element = document.createElement('span');
  const text = document.createElement('span');
  const spokenName = document.createElement('span');
  spokenName.className = 'visually-hidden';
  element.append(text, ...after, spokenName);
  const update = (next: BadgeProps): void => {
    const model = badgeModel(next);
    const isSpokenDifferently = model.heardAs !== model.text;
    element.className = model.classes.join(' ');
    writeText(text, model.text);
    // Heard differently: the visible text is hidden from screen readers and a hidden name speaks.
    if (isSpokenDifferently) {
      text.setAttribute('aria-hidden', 'true');
    } else {
      text.removeAttribute('aria-hidden');
    }
    writeText(spokenName, isSpokenDifferently ? model.heardAs : '');
  };
  update(props);
  return { element, update };
}
