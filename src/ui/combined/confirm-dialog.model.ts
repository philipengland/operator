// Confirm dialog (combined component): a question and two answers (spec-006 FR-608;
// docs/contracts/component-library.md).

import type { ButtonProps } from '../simple/button.model';

export interface ConfirmDialogProps {
  readonly question: string;
  /** The answer that goes ahead. */
  readonly confirm: string;
  /** The answer that changes nothing. */
  readonly cancel: string;
}

export interface ConfirmDialogModel {
  readonly confirmButton: ButtonProps;
  readonly cancelButton: ButtonProps;
}

export function confirmDialogModel({ confirm, cancel }: ConfirmDialogProps): ConfirmDialogModel {
  return { confirmButton: { label: confirm, style: 'solid' }, cancelButton: { label: cancel, style: 'key' } };
}
