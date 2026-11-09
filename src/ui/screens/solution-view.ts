// Solution view (screen): a heading, a way back and the whole puzzle as solved, read-only
// (docs/contracts/component-library.md).

import './solution-view.css';
import type { Component } from '../component';
import { createOperatorHeader } from '../combined/operator-header';
import { createPuzzleGrid } from '../combined/puzzle-grid';
import { createButton } from '../simple/button';
import { solutionViewBack, solutionViewHeader, type SolutionViewProps } from './solution-view.model';

export { solutionViewBack, solutionViewHeader, type SolutionViewProps } from './solution-view.model';

/** The components this screen is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Operator header', 'Button', 'Puzzle grid'];

export interface SolutionViewActions {
  readonly onBack?: () => void;
}

export function createSolutionView(props: SolutionViewProps, actions: SolutionViewActions = {}): Component<SolutionViewProps> {
  const element = document.createElement('div');
  element.className = 'solution-view';
  const header = createOperatorHeader(solutionViewHeader(props));
  const back = createButton(solutionViewBack(props), actions.onBack);
  const top = document.createElement('div');
  top.className = 'solution-view__top';
  top.append(header.element, back.element);
  const grid = createPuzzleGrid(props.grid);
  element.append(top, grid.element);
  const update = (next: SolutionViewProps): void => {
    header.update(solutionViewHeader(next));
    back.update(solutionViewBack(next));
    grid.update(next.grid);
  };
  update(props);
  return { element, update };
}
