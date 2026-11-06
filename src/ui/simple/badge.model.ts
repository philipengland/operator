// Badge (simple component): an ink pill for short text such as a line's target ("× 12")
// (spec-003 FR-310; docs/contracts/component-library.md). Heard as its text.

/** Ink (the default) for targets; light for a count on an accent or ink surface (design guide). */
export type BadgeStyle = 'ink' | 'light';

export interface BadgeProps {
  readonly text: string;
  readonly style?: BadgeStyle;
}

export interface BadgeModel {
  readonly text: string;
  /** The classes that make the ink pill (badge.css). */
  readonly classes: readonly string[];
}

export function badgeModel({ text, style = 'ink' }: BadgeProps): BadgeModel {
  return { text, classes: style === 'light' ? ['badge', 'badge--light'] : ['badge'] };
}
