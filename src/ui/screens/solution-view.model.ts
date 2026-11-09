// Solution view (screen): one found solution, read-only (spec-006 FR-606;
// docs/contracts/component-library.md). Wording is passed in.

import type { PuzzleGridProps } from '../combined/puzzle-grid';
import type { SpeechBubbleProps } from '../combined/speech-bubble';
import type { ButtonProps } from '../simple/button';

export interface SolutionViewProps {
  readonly heading: string;
  readonly backLabel: string;
  readonly grid: PuzzleGridProps;
}

/** The bubble at the top: the solution's number. */
export function solutionViewHeader({ heading }: Pick<SolutionViewProps, 'heading'>): SpeechBubbleProps {
  return { title: heading, message: '', isTitleHeading: true };
}

export function solutionViewBack({ backLabel }: Pick<SolutionViewProps, 'backLabel'>): ButtonProps {
  return { label: backLabel, style: 'key' };
}
