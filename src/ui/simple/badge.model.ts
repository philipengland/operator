// Badge (simple component): an ink pill for short text such as a line's target ("× 12")
// (spec-003 FR-310; docs/contracts/component-library.md). Heard as its text.

export interface BadgeProps {
  readonly text: string;
}

export interface BadgeModel {
  readonly text: string;
  /** The classes that make the ink pill (badge.css). */
  readonly classes: readonly string[];
}

export function badgeModel({ text }: BadgeProps): BadgeModel {
  return { text, classes: ['badge'] };
}
