// Solution list (screen): a heading and a way back, the solutions found or a line saying there are none,
// and a way to start again at the foot of the screen (docs/contracts/component-library.md).

import './solution-list.css';
import type { Component } from '../component';
import { createOperatorHeader } from '../combined/operator-header';
import { createButton } from '../simple/button';
import { solutionListHeader, solutionListModel, type SolutionListProps } from './solution-list.model';

export { solutionListHeader, solutionListModel, type SolutionListProps } from './solution-list.model';

/** The components this screen is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Operator header', 'Button'];

export interface SolutionListActions {
  readonly onBack?: () => void;
  /** `index` counts from 0, in the order found. */
  readonly onRow?: (index: number) => void;
  readonly onStartAgain?: () => void;
}

export interface SolutionListScreen extends Component<SolutionListProps> {
  focusHeading(): void;
}

export function createSolutionList(props: SolutionListProps, actions: SolutionListActions = {}): SolutionListScreen {
  const element = document.createElement('div');
  element.className = 'solution-list';
  const header = createOperatorHeader(solutionListHeader(props));
  const back = createButton(solutionListModel(props).back, actions.onBack);
  const top = document.createElement('div');
  top.className = 'solution-list__top';
  top.append(header.element, back.element);
  const rows = document.createElement('div');
  rows.className = 'solution-list__rows';
  const foot = document.createElement('div');
  foot.className = 'solution-list__foot';
  element.append(top, rows, foot);
  let drawn = '';
  const update = (next: SolutionListProps): void => {
    const model = solutionListModel(next);
    header.update(solutionListHeader(next));
    back.update(model.back);
    // Rows are redrawn only when they change, so a row keeps focus when nothing has changed.
    const nextDrawn = JSON.stringify(model);
    if (nextDrawn !== drawn) {
      drawn = nextDrawn;
      rows.replaceChildren(...model.rows.map((row, index) => createButton(row, () => actions.onRow?.(index)).element), ...emptyLine(model.empty));
      foot.replaceChildren(...(model.startAgain ? [createButton(model.startAgain, actions.onStartAgain).element] : []));
    }
  };
  update(props);
  return { element, update, focusHeading: () => element.querySelector('h1')?.focus() };
}

/** What a screen reader hears from an empty list; what it shows is in the bubble (spec-006 FR-603). */
function emptyLine(empty: SolutionListProps['empty'] | null): readonly HTMLElement[] {
  if (empty === null) {
    return [];
  }
  const heard = document.createElement('p');
  heard.className = 'visually-hidden';
  heard.textContent = empty.heardAs;
  return [heard];
}
