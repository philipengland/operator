// Workings strip (combined component, spec-007 FR-718): a panel Surface under a large grid holding
// two Line workings, or one line of body Text (docs/contracts/component-library.md). Hidden from
// screen readers: each line's working is heard beside its line, and the operator's line in the
// play screen's status, so nothing is heard twice.

import './workings-strip.css';
import type { Component } from '../component';
import { createSurface } from '../simple/surface';
import { createText } from '../simple/text';
import { createLineWorking } from './line-working';
import { workingsStripModel, type WorkingsStripProps } from './workings-strip.model';

export { workingsStripModel, type WorkingsStripProps } from './workings-strip.model';

/** The components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Surface', 'Line working', 'Text'];

const NO_WORKING = { result: '', mark: 'none', name: '' } as const;
// The row's working and the column's.
const WORKINGS_SHOWN = 2;

export function createWorkingsStrip(props: WorkingsStripProps): Component<WorkingsStripProps> {
  const workings = Array.from({ length: WORKINGS_SHOWN }, () => createLineWorking(NO_WORKING));
  const text = createText({ text: '', style: 'body' });
  const surface = createSurface({ variant: 'panel' }, [...workings.map((working) => working.element), text.element]);
  surface.element.classList.add('workings-strip');
  surface.element.setAttribute('aria-hidden', 'true');
  const update = (next: WorkingsStripProps): void => {
    const model = workingsStripModel(next);
    workings.forEach((working, index) => {
      const shown = model.workings[index];
      working.element.hidden = shown === undefined;
      working.update(shown ?? NO_WORKING);
    });
    text.update({ text: model.text, style: 'body' });
    text.element.hidden = model.text === '';
  };
  update(props);
  return { element: surface.element, update };
}
