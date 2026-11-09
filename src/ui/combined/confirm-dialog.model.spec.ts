import { describe, expect, it } from 'vitest';
import { confirmDialogModel } from './confirm-dialog.model';

describe('confirmDialogModel', () => {
  it('shows going ahead in solid ink, and changing nothing as an ordinary key', () => {
    expect(confirmDialogModel({ question: 'Clear all solutions?', confirm: 'Yes, clear', cancel: 'Keep them' })).toEqual({
      confirmButton: { label: 'Yes, clear', style: 'solid' },
      cancelButton: { label: 'Keep them', style: 'key' },
    });
  });
});
