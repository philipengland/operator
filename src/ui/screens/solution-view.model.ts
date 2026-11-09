// Solution view (screen): one found solution, read-only (spec-006 FR-606;
// docs/contracts/component-library.md). Wording is passed in.

import type { PuzzleGridProps } from '../combined/puzzle-grid';
import type { ButtonProps } from '../simple/button.model';

export interface SolutionViewProps {
  readonly heading: string;
  readonly backLabel: string;
  readonly grid: PuzzleGridProps;
}

export function solutionViewBack({ backLabel }: Pick<SolutionViewProps, 'backLabel'>): ButtonProps {
  return { label: backLabel, style: 'key' };
}
