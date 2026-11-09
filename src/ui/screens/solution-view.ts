// Solution view (screen): a heading, a way back and the whole puzzle as solved, read-only
// (docs/contracts/component-library.md).

import './solution-view.css';
import { writeText, type Component } from '../component';
import { createPuzzleGrid } from '../combined/puzzle-grid';
import { createButton } from '../simple/button';
import { solutionViewBack, type SolutionViewProps } from './solution-view.model';

export { solutionViewBack, type SolutionViewProps } from './solution-view.model';

/** The components this screen is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Button', 'Puzzle grid'];

export interface SolutionViewActions {
  readonly onBack?: () => void;
}

export function createSolutionView(props: SolutionViewProps, actions: SolutionViewActions = {}): Component<SolutionViewProps> {
  const element = document.createElement('div');
  element.className = 'solution-view';
  const title = document.createElement('h1');
  title.className = 'solution-view__heading';
  const back = createButton(solutionViewBack(props), actions.onBack);
  const top = document.createElement('div');
  top.className = 'solution-view__top';
  top.append(title, back.element);
  const grid = createPuzzleGrid(props.grid);
  element.append(top, grid.element);
  const update = (next: SolutionViewProps): void => {
    writeText(title, next.heading);
    back.update(solutionViewBack(next));
    grid.update(next.grid);
  };
  update(props);
  return { element, update };
}
