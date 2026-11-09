// Confirm dialog (combined component): a Dialog holding a question and two Buttons. The answer that
// changes nothing comes first, so it is where focus lands when the dialog opens.

import './confirm-dialog.css';
import { createButton } from '../simple/button';
import { createDialog, type DialogComponent } from '../simple/dialog';
import { createText } from '../simple/text';
import { confirmDialogModel, type ConfirmDialogProps } from './confirm-dialog.model';

export { confirmDialogModel, type ConfirmDialogProps } from './confirm-dialog.model';

/** The simple components this one is laid out from (spec-003 AC-7). */
export const builtFrom: readonly string[] = ['Dialog', 'Text', 'Button'];

export interface ConfirmDialogActions {
  readonly onConfirm?: () => void;
  readonly onCancel?: () => void;
}

export function createConfirmDialog(props: ConfirmDialogProps, actions: ConfirmDialogActions = {}): DialogComponent<ConfirmDialogProps> {
  const model = confirmDialogModel(props);
  const question = createText({ text: props.question, style: 'display' });
  const cancelButton = createButton(model.cancelButton, actions.onCancel);
  const confirmButton = createButton(model.confirmButton, actions.onConfirm);
  const answers = document.createElement('div');
  answers.className = 'confirm-dialog__answers';
  answers.append(cancelButton.element, confirmButton.element);
  const dialog = createDialog({ name: props.question }, [question.element, answers], actions.onCancel);
  const update = (next: ConfirmDialogProps): void => {
    const nextModel = confirmDialogModel(next);
    question.update({ text: next.question, style: 'display' });
    cancelButton.update(nextModel.cancelButton);
    confirmButton.update(nextModel.confirmButton);
    dialog.update({ name: next.question });
  };
  return { ...dialog, update };
}
