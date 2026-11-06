// Icon (simple component): an inline SVG tick or cross stroked in the text colour
// (docs/contracts/component-library.md). Heard as its meaning, or hidden when decoration.

import './icon.css';
import type { Component } from '../component';
import { iconModel, type IconProps, type IconShape } from './icon.model';

export { iconModel, type IconProps, type IconShape } from './icon.model';

/** Simple components are built from the foundations only. */
export const builtFrom: readonly string[] = [];

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const VIEW_BOX = '0 0 24 24';
const STROKES: Readonly<Record<IconShape, string>> = {
  tick: 'M4 13l5 5L20 6',
  cross: 'M6 6l12 12M18 6L6 18',
};

export function createIcon(props: IconProps): Component<IconProps> {
  const element = document.createElement('span');
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', VIEW_BOX);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const stroke = document.createElementNS(SVG_NAMESPACE, 'path');
  svg.append(stroke);
  element.append(svg);
  const update = (next: IconProps): void => {
    const model = iconModel(next);
    element.className = model.classes.join(' ');
    stroke.setAttribute('d', STROKES[next.icon]);
    if (model.isHeard) {
      element.setAttribute('role', 'img');
      element.setAttribute('aria-label', model.name ?? '');
      element.removeAttribute('aria-hidden');
    } else {
      element.removeAttribute('role');
      element.removeAttribute('aria-label');
      element.setAttribute('aria-hidden', 'true');
    }
  };
  update(props);
  return { element, update };
}
