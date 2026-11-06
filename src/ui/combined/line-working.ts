// Line working (combined component): the result slot as display Text, then a tick or cross Icon
// (docs/contracts/component-library.md). Heard as the line's whole working: the visible slot is
// hidden from screen readers and one visually hidden name speaks for it (spec-002 contract).
// A mark is shown by its symbol, not colour or weight (owner decision 2026-11-06: Chewy has one weight).

import './line-working.css';
import { writeText, type Component } from '../component';
import { createIcon } from '../simple/icon';
import { createText } from '../simple/text';
import { lineWorkingModel, type LineWorkingProps } from './line-working.model';

export { lineWorkingModel, type LineWorkingProps, type WorkingMark } from './line-working.model';

/** The simple components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Text', 'Icon'];

export function createLineWorking(props: LineWorkingProps): Component<LineWorkingProps> {
  const element = document.createElement('span');
  element.className = 'line-working';
  const name = document.createElement('span');
  name.className = 'visually-hidden';
  const result = createText({ text: '', style: 'display' });
  const mark = createIcon({ icon: 'tick' });
  const shown = document.createElement('span');
  shown.className = 'line-working__shown';
  shown.setAttribute('aria-hidden', 'true');
  shown.append(result.element, mark.element);
  element.append(name, shown);
  const update = (next: LineWorkingProps): void => {
    const model = lineWorkingModel(next);
    writeText(name, model.heardAs);
    result.update({ text: model.result, style: 'display' });
    mark.element.hidden = model.icon === null;
    if (model.icon !== null) {
      mark.update({ icon: model.icon });
    }
  };
  update(props);
  return { element, update };
}
