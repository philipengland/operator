// Solutions counter (combined component): a Surface holding the title, the count Badge and, when
// complete, a tick Icon (docs/contracts/component-library.md). Heard as one phrase, "Found 1 of 2":
// the visible parts are hidden from screen readers and one visually hidden name speaks for them.

import './solutions-counter.css';
import { writeText, type Component } from '../component';
import { createBadge } from '../simple/badge';
import { createIcon } from '../simple/icon';
import { createSurface } from '../simple/surface';
import { createText } from '../simple/text';
import { solutionsCounterModel, type SolutionsCounterProps } from './solutions-counter.model';

export { solutionsCounterModel, type SolutionsCounterProps } from './solutions-counter.model';

/** The simple components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Surface', 'Text', 'Badge', 'Icon'];

export function createSolutionsCounter(props: SolutionsCounterProps): Component<SolutionsCounterProps> {
  const name = document.createElement('span');
  name.className = 'visually-hidden';
  const tick = createIcon({ icon: 'tick' });
  const title = createText({ text: '', style: 'display' });
  const count = createBadge({ text: '', style: 'light' }, [tick.element]);
  const shown = document.createElement('span');
  shown.className = 'solutions-counter__shown';
  shown.setAttribute('aria-hidden', 'true');
  shown.append(title.element, count.element);
  const surface = createSurface({ variant: 'panel' }, [name, shown]);
  const update = (next: SolutionsCounterProps): void => {
    const model = solutionsCounterModel(next);
    surface.update({ variant: 'panel', fill: model.fill });
    writeText(name, model.heardAs);
    title.update({ text: model.title, style: 'display' });
    count.update({ text: model.count, style: 'light' });
    tick.element.hidden = !model.isComplete;
  };
  update(props);
  return { element: surface.element, update };
}
