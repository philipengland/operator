// Solution list (screen): a heading and a way back, the solutions found or a line saying there are none,
// and a way to start again at the foot of the screen (docs/contracts/component-library.md).

import './solution-list.css';
import { writeText, type Component } from '../component';
import { createButton } from '../simple/button';
import { createText } from '../simple/text';
import { solutionListModel, type SolutionListProps } from './solution-list.model';

export { solutionListModel, type SolutionListProps } from './solution-list.model';

/** The components this screen is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Text', 'Button'];

export interface SolutionListActions {
  readonly onBack?: () => void;
  /** `index` counts from 0, in the order found. */
  readonly onRow?: (index: number) => void;
  readonly onStartAgain?: () => void;
}

export function createSolutionList(props: SolutionListProps, actions: SolutionListActions = {}): Component<SolutionListProps> {
  const element = document.createElement('div');
  element.className = 'solution-list';
  const title = document.createElement('h1');
  title.className = 'solution-list__heading';
  const back = createButton(solutionListModel(props).back, actions.onBack);
  const top = document.createElement('div');
  top.className = 'solution-list__top';
  top.append(title, back.element);
  const rows = document.createElement('div');
  rows.className = 'solution-list__rows';
  const foot = document.createElement('div');
  foot.className = 'solution-list__foot';
  element.append(top, rows, foot);
  let drawn = '';
  const update = (next: SolutionListProps): void => {
    const model = solutionListModel(next);
    writeText(title, next.heading);
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
  return { element, update };
}

/** The empty list's line: one thing shown, another heard (spec-006 FR-603). */
function emptyLine(empty: SolutionListProps['empty'] | null): readonly HTMLElement[] {
  if (empty === null) {
    return [];
  }
  const line = document.createElement('p');
  const heard = document.createElement('span');
  heard.className = 'visually-hidden';
  heard.textContent = empty.heardAs;
  const shown = createText({ text: empty.shown, style: 'body' });
  shown.element.setAttribute('aria-hidden', 'true');
  line.append(heard, shown.element);
  return [line];
}
