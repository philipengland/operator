// Surface (simple component): the outlined tile panels that hold everything, and the bubble
// variant with an accent shadow and a tail corner (spec-003 FR-310; docs/contracts/component-library.md).

export type SurfaceVariant = 'panel' | 'bubble';

export interface SurfaceProps {
  readonly variant: SurfaceVariant;
}

export interface SurfaceModel {
  /** The classes that give the surface its fill, outline, shadow and corners (surface.css). */
  readonly classes: readonly string[];
}

export function surfaceModel({ variant }: SurfaceProps): SurfaceModel {
  return { classes: ['surface', `surface--${variant}`] };
}
