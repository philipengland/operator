// Mascot (simple component): the operator character as inline SVG, painted with the theme's
// colours and hidden from screen readers (docs/contracts/component-library.md).

import './mascot.css';
import type { Component } from '../component';
import { mascotModel, type MascotShape } from './mascot.model';

export { mascotModel } from './mascot.model';

/** Simple components are built from the foundations only. */
export const builtFrom: readonly string[] = [];

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export function createMascot(): Component<void> {
  const model = mascotModel();
  const element = document.createElement('span');
  element.className = 'mascot';
  element.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', model.viewBox);
  svg.setAttribute('focusable', 'false');
  svg.append(...model.shapes.map(drawShape));
  element.append(svg);
  return { element, update: () => undefined };
}

/** One shape, its paint given by classes so the theme's colours fill it (mascot.css). */
function drawShape(shape: MascotShape): SVGElement {
  const drawn = document.createElementNS(SVG_NAMESPACE, shape.tag);
  Object.entries(shape.geometry).forEach(([name, value]) => drawn.setAttribute(name, value));
  const paint = [`mascot__fill--${shape.fill ?? 'none'}`, shape.stroke ? `mascot__stroke--${shape.stroke}` : ''];
  drawn.setAttribute('class', paint.filter(Boolean).join(' '));
  return drawn;
}
