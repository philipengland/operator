// Surface (simple component): the outlined tile panels that hold everything, and the bubble
// variant with an accent shadow and a tail corner (spec-003 FR-310; docs/contracts/component-library.md).

export type SurfaceVariant = 'panel' | 'bubble';

/** Tile (the default) for panels; accent or ink for a surface that reports progress. */
export type SurfaceFill = 'tile' | 'accent' | 'ink';

export interface SurfaceProps {
  readonly variant: SurfaceVariant;
  readonly fill?: SurfaceFill;
  /** Something the player can tap: the whole surface is one button. */
  readonly isTappable?: boolean;
}

export interface SurfaceModel {
  /** The classes that give the surface its fill, outline, shadow and corners (surface.css). */
  readonly classes: readonly string[];
}

export function surfaceModel({ variant, fill = 'tile', isTappable = false }: SurfaceProps): SurfaceModel {
  return {
    classes: ['surface', `surface--${variant}`, ...(fill === 'tile' ? [] : [`surface--${fill}`]), ...(isTappable ? ['surface--tappable'] : [])],
  };
}
