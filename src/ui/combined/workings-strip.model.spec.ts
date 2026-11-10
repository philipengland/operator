import { describe, expect, it } from 'vitest';
import { workingsStripModel } from './workings-strip.model';

describe('workingsStripModel', () => {
  it("shows the selected cell's row working, then its column working, and no line of text", () => {
    const row = { result: '6 + 2 = 8', mark: 'tick', name: 'Row 1 working, 6 + 2 = 8, target reached' } as const;
    const column = { result: '6 ÷ ?', mark: 'none', name: 'Column 1 working, 6 ÷ ?' } as const;

    expect(workingsStripModel({ workings: [row, column] })).toEqual({ workings: [row, column], text: '' });
  });

  it('shows a line of text in place of the workings', () => {
    expect(workingsStripModel({ text: 'Tap a cell to see its row and column.' })).toEqual({
      workings: [],
      text: 'Tap a cell to see its row and column.',
    });
  });
});
