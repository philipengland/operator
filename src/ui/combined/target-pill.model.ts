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
  /** Operator above target, in smaller text: a column pill on a grid of 3 or more columns (spec-007 FR-713). */
  readonly isStacked?: boolean;
}

export interface TargetPillModel {
  readonly kind: 'badge' | 'button';
  readonly text: string;
  readonly heardAs: string;
  readonly hasTick: boolean;
}

const NOT_CHOSEN = '?';
const MINUS = '−';
// Same wording as a line working that reaches its target (play-screen contract, spec-002).
const TARGET_REACHED = ', target reached';

/** A target as written: a negative one with the minus sign the operators use (U+2212), never a hyphen. */
function shown(target: number): string {
  return target < 0 ? `${MINUS}${-target}` : String(target);
}

export function targetPillModel({ target, operator, isOpen, name, reachesTarget = false }: TargetPillProps): TargetPillModel {
  return {
    kind: isOpen ? 'button' : 'badge',
    text: `${operator ?? NOT_CHOSEN} ${shown(target)}`,
    heardAs: reachesTarget ? `${name}${TARGET_REACHED}` : name,
    hasTick: reachesTarget,
  };
}

/**
 * Whether a hidden tick still takes its room, so the pill never changes size. A stacked column pill leaves it
 * out, so its text is centred on the column; its tick appears beside the text (owner, 2026-11-12).
 */
export function isTickPlaceKept({ isStacked = false }: TargetPillProps): boolean {
  return !isStacked;
}
