import { describe, expect, it } from 'vitest';
import { writeText } from './component';

describe('writeText', () => {
  it('writes new text into the element', () => {
    const target = { textContent: 'Found 0 of 2' };

    writeText(target, 'Found 1 of 2');

    expect(target.textContent).toBe('Found 1 of 2');
  });
});
