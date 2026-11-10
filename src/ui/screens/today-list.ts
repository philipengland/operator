// Today list (screen, spec-007 FR-701): a region headed like the Solution list, with a way back,
// then one row per choice (docs/contracts/component-library.md).

import './today-list.css';
import type { Component } from '../component';
import { createOperatorHeader } from '../combined/operator-header';
import { createButton } from '../simple/button';
import { todayListHeader, todayListModel, type TodayListProps } from './today-list.model';

export { todayListHeader, todayListModel, type TodayListProps } from './today-list.model';

/** The components this screen is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Operator header', 'Button'];

export interface TodayListActions {
  readonly onBack?: () => void;
  /** `index` counts from 0, in the order shown. */
  readonly onRow?: (index: number) => void;
}

export interface TodayListScreen extends Component<TodayListProps> {
  focusHeading(): void;
}

export function createTodayList(props: TodayListProps, actions: TodayListActions = {}): TodayListScreen {
  const element = document.createElement('section');
  element.className = 'today-list';
  const header = createOperatorHeader(todayListHeader(props));
  const back = createButton(todayListModel(props).back, actions.onBack);
  const top = document.createElement('div');
  top.className = 'today-list__top';
  top.append(header.element, back.element);
  const rows = document.createElement('div');
  rows.className = 'today-list__rows';
  element.append(top, rows);
  let drawn = '';
  const update = (next: TodayListProps): void => {
    const model = todayListModel(next);
    element.setAttribute('aria-label', next.heading);
    header.update(todayListHeader(next));
    back.update(model.back);
    // Rows are redrawn only when they change, so a row keeps focus when nothing has changed.
    const nextDrawn = JSON.stringify(model.rows);
    if (nextDrawn !== drawn) {
      drawn = nextDrawn;
      rows.replaceChildren(...model.rows.map((row, index) => createButton(row, () => actions.onRow?.(index)).element));
    }
  };
  update(props);
  return { element, update, focusHeading: () => element.querySelector('h1')?.focus() };
}
