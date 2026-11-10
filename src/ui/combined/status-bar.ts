// Status bar (combined component, spec-007 FR-719): a region holding the Solutions counter and the
// Today Button side by side, one touch target high (docs/contracts/component-library.md).

import './status-bar.css';
import type { Component } from '../component';
import { createButton } from '../simple/button';
import { createSolutionsCounter, type SolutionsCounterProps } from './solutions-counter';
import { statusBarModel } from './status-bar.model';

export { statusBarModel, TODAY_BUTTON } from './status-bar.model';

/** The components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Solutions counter', 'Button'];

export interface StatusBarProps {
  readonly counter: SolutionsCounterProps;
}

export interface StatusBarActions {
  readonly onCounter?: () => void;
  readonly onToday?: () => void;
}

export function createStatusBar(props: StatusBarProps, actions: StatusBarActions = {}): Component<StatusBarProps> {
  const model = statusBarModel();
  const counter = createSolutionsCounter(props.counter, actions.onCounter);
  const today = createButton(model.todayButton, actions.onToday);
  const element = document.createElement('section');
  element.className = 'status-bar';
  element.setAttribute('aria-label', model.name);
  element.append(counter.element, today.element);
  const update = (next: StatusBarProps): void => counter.update(next.counter);
  return { element, update };
}
