// Surface (simple component): an outlined tile panel, or the bubble variant with an accent shadow
// and a tail corner, holding whatever is placed inside it (docs/contracts/component-library.md).

import './surface.css';
import type { Component } from '../component';
import { surfaceModel, type SurfaceProps } from './surface.model';

export { surfaceModel, type SurfaceFill, type SurfaceProps, type SurfaceVariant } from './surface.model';

/** Simple components are built from the foundations only. */
export const builtFrom: readonly string[] = [];

/** A surface; with `onTap` the whole surface is a real button, named by what it holds. */
export function createSurface(props: SurfaceProps, content: readonly Node[] = [], onTap?: () => void): Component<SurfaceProps> {
  const element = onTap ? createTapTarget(onTap) : document.createElement('div');
  element.append(...content);
  const isTappable = onTap !== undefined;
  const update = (next: SurfaceProps): void => {
    element.className = surfaceModel({ ...next, isTappable }).classes.join(' ');
  };
  update(props);
  return { element, update };
}

function createTapTarget(onTap: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.addEventListener('click', onTap);
  return button;
}
