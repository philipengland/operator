import { describe, expect, it } from 'vitest';
import { dialogModel } from './dialog.model';

describe('dialogModel', () => {
  it('is called by the question it asks, and has its own look', () => {
    expect(dialogModel({ name: 'Clear all solutions?' })).toEqual({ name: 'Clear all solutions?', classes: ['dialog'] });
  });
});
