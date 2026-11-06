import { describe, expect, it } from 'vitest';
import { textInputModel } from './text-input.model';

describe('textInputModel', () => {
  it('gives the field an id made from its label, for the label to point at', () => {
    expect(textInputModel({ label: 'Play from a seed', hint: 'e.g. 4F7A21' }).fieldId).toBe('field-play-from-a-seed');
  });
});
