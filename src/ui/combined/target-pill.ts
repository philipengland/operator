// Target pill (combined component): a Badge for a shown operator, a dashed Button for an open one,
// and a tick Icon when the line reaches its target (docs/contracts/component-library.md).
// Whether a line's operator is shown or open is fixed for a puzzle, so it is chosen once.

import './target-pill.css';
import { showKeepingItsPlace, type Component } from '../component';
import { createBadge } from '../simple/badge';
import { createButton } from '../simple/button';
import { createIcon } from '../simple/icon';
import { targetPillModel, type TargetPillProps } from './target-pill.model';

export { targetPillModel, type TargetOperator, type TargetPillProps } from './target-pill.model';

/** The simple components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Badge', 'Button', 'Icon'];

/** A pill for one line; an open pill calls `onChoose` when tapped (the next operator, FR-006). */
export function createTargetPill(props: TargetPillProps, onChoose?: () => void): Component<TargetPillProps> {
  return props.isOpen ? openPill(props, onChoose) : shownPill(props);
}

function shownPill(props: TargetPillProps): Component<TargetPillProps> {
  const tick = createIcon({ icon: 'tick' });
  const badge = createBadge({ text: '', spokenAs: '' }, [tick.element]);
  const update = (next: TargetPillProps): void => {
    const model = targetPillModel(next);
    badge.update({ text: model.text, spokenAs: model.heardAs });
    showKeepingItsPlace(tick.element, model.hasTick);
  };
  update(props);
  return { element: badge.element, update };
}

function openPill(props: TargetPillProps, onChoose?: () => void): Component<TargetPillProps> {
  const tick = createIcon({ icon: 'tick' });
  const button = createButton({ label: '', style: 'dashed' }, onChoose, [tick.element]);
  const update = (next: TargetPillProps): void => {
    const model = targetPillModel(next);
    button.update({ label: model.text, style: 'dashed', action: model.heardAs });
    showKeepingItsPlace(tick.element, model.hasTick);
  };
  update(props);
  return { element: button.element, update };
}
