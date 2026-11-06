// Icon (simple component): a tick or a cross, heard when it carries meaning and hidden from
// screen readers when it is decoration (spec-003 FR-309; docs/contracts/component-library.md).

export type IconShape = 'tick' | 'cross';

export interface IconProps {
  readonly icon: IconShape;
  /** What the icon means, for screen readers ("target reached"). Leave out for decoration. */
  readonly spokenAs?: string;
}

export interface IconModel {
  readonly isHeard: boolean;
  readonly name: string | null;
  /** The classes that size and draw the icon (icon.css). */
  readonly classes: readonly string[];
}

export function iconModel({ icon, spokenAs }: IconProps): IconModel {
  return { isHeard: spokenAs !== undefined, name: spokenAs ?? null, classes: ['icon', `icon--${icon}`] };
}
