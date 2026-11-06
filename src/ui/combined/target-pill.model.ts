// Target pill (combined component): a line's target and operator together (spec-003 FR-315;
// docs/contracts/component-library.md). A shown operator is an ink badge ("+ 16"); an open one is a
// dashed button the player taps to choose ("? 12"); a line that reaches its target gains a tick.

/** The four operators as the player sees them (the minus sign is U+2212). */
export type TargetOperator = '+' | '−' | '×' | '÷';

export interface TargetPillProps {
  readonly target: number;
  /** The line's operator; null while an open operator is not chosen. */
  readonly operator: TargetOperator | null;
  /** True when the player chooses this line's operator. */
  readonly isOpen: boolean;
  /** How the line is heard, e.g. "Row 1 target 16, plus" (the play screen's wording). */
  readonly name: string;
  readonly reachesTarget?: boolean;
}

export interface TargetPillModel {
  readonly kind: 'badge' | 'button';
  readonly text: string;
  readonly heardAs: string;
  readonly hasTick: boolean;
}

export function targetPillModel({ target, operator, name }: TargetPillProps): TargetPillModel {
  return { kind: 'badge', text: `${operator} ${target}`, heardAs: name, hasTick: false };
}
