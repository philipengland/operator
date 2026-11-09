// Dialog (simple component): a native modal <dialog>, so the browser keeps focus inside it, makes the
// screen behind it inert and returns focus when it closes (spec-006 research R10).

import './dialog.css';
import type { Component } from '../component';
import { dialogModel, type DialogProps } from './dialog.model';

export { dialogModel, type DialogProps } from './dialog.model';

/** Simple components are built from the foundations only. */
export const builtFrom: readonly string[] = [];

export interface DialogComponent<Props> extends Component<Props> {
  open(): void;
  close(): void;
}

/** A dialog holding `content`; `onDismiss` is called when the browser's own way out is used. */
export function createDialog(props: DialogProps, content: readonly Node[] = [], onDismiss?: () => void): DialogComponent<DialogProps> {
  const element = document.createElement('dialog');
  element.append(...content);
  element.addEventListener('cancel', (event) => {
    event.preventDefault();
    onDismiss?.();
  });
  const update = (next: DialogProps): void => {
    const model = dialogModel(next);
    element.className = model.classes.join(' ');
    element.setAttribute('aria-label', model.name);
  };
  update(props);
  const open = (): void => {
    if (!element.open) {
      element.showModal();
    }
  };
  const close = (): void => {
    if (element.open) {
      element.close();
    }
  };
  return { element, update, open, close };
}
