import { describe, expect, it } from 'vitest';
import { statusBarModel } from './status-bar.model';

describe('statusBarModel', () => {
  it('is a region named "Status bar" with a Today button heard as "Today\'s puzzles"', () => {
    expect(statusBarModel()).toEqual({
      name: 'Status bar',
      todayButton: { label: 'Today', name: "Today's puzzles", style: 'key' },
    });
  });
});
