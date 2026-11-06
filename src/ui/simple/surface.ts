// Surface (simple component): an outlined tile panel, or the bubble variant with an accent shadow
// and a tail corner, holding whatever is placed inside it (docs/contracts/component-library.md).

import './surface.css';
import type { Component } from '../component';
import { surfaceModel, type SurfaceProps } from './surface.model';

export { surfaceModel, type SurfaceFill, type SurfaceProps, type SurfaceVariant } from './surface.model';

/** Simple components are built from the foundations only. */
export const builtFrom: readonly string[] = [];

export function createSurface(props: SurfaceProps, content: readonly Node[] = []): Component<SurfaceProps> {
  const element = document.createElement('div');
  element.append(...content);
  const update = (next: SurfaceProps): void => {
    element.className = surfaceModel(next).classes.join(' ');
  };
  update(props);
  return { element, update };
}
