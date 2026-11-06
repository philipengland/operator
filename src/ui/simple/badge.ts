// Badge (simple component): an ink pill for short text, heard as its text
// (docs/contracts/component-library.md).

import './badge.css';
import { writeText, type Component } from '../component';
import { badgeModel, type BadgeProps } from './badge.model';

export { badgeModel, type BadgeProps } from './badge.model';

/** Simple components are built from the foundations only. */
export const builtFrom: readonly string[] = [];

export function createBadge(props: BadgeProps): Component<BadgeProps> {
  const element = document.createElement('span');
  const update = (next: BadgeProps): void => {
    const model = badgeModel(next);
    element.className = model.classes.join(' ');
    writeText(element, model.text);
  };
  update(props);
  return { element, update };
}
