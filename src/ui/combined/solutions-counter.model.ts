// Solutions counter (combined component): how many distinct solutions the player has found
// (spec-003 FR-314; docs/contracts/component-library.md). Heard as one phrase, "Found 1 of 2".

import type { SurfaceFill } from '../simple/surface.model';

export interface SolutionsCounterProps {
  readonly found: number;
  /** How many solutions the puzzle has, when known. */
  readonly total?: number;
}

export interface SolutionsCounterModel {
  readonly title: string;
  readonly count: string;
  readonly isComplete: boolean;
  readonly fill: SurfaceFill;
  readonly heardAs: string;
}

export function solutionsCounterModel({ found, total }: SolutionsCounterProps): SolutionsCounterModel {
  const count = total === undefined ? `${found}` : `${found} of ${total}`;
  const isComplete = found === total;
  return {
    title: isComplete ? 'All found!' : 'Solutions found',
    count,
    isComplete,
    fill: isComplete ? 'ink' : 'accent',
    heardAs: `Found ${count}`,
  };
}
