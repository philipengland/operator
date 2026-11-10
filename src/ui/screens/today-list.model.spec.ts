import { describe, expect, it } from 'vitest';
import { todayListModel } from './today-list.model';

describe('todayListModel', () => {
  it('makes each choice a button, shown and heard alike, after a way back', () => {
    const props = { heading: 'Today', backLabel: 'Back', rows: ['Easy, found 1 of 4', 'Practice, found 0 of 2'] };

    expect(todayListModel(props)).toEqual({
      back: { label: 'Back', style: 'key' },
      rows: [
        { label: 'Easy, found 1 of 4', style: 'key' },
        { label: 'Practice, found 0 of 2', style: 'key' },
      ],
    });
  });
});
