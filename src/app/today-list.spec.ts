import { describe, expect, it } from 'vitest';
import { openToday, startDaily, todayRows } from './daily';
import { startSession } from './session';
import { todayListProps } from './today-list';

describe('todayListProps', () => {
  it('heads the screen "Today", with a way back, and lists the rows (spec-007 FR-701)', () => {
    const daily = openToday(startDaily('2026-11-10', startSession(), ['easy']));

    expect(todayListProps(daily)).toEqual({ heading: 'Today', backLabel: 'Back', rows: todayRows(daily) });
  });
});
