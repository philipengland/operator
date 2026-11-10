import { describe, expect, it } from 'vitest';
import { openToday, startDaily } from './daily';
import { startSession } from './session';

const TENTH_OF_NOVEMBER = '2026-11-10';

describe('openToday', () => {
  it('shows the Today screen over the puzzle, changing nothing else (spec-007 FR-701)', () => {
    const daily = startDaily(TENTH_OF_NOVEMBER, startSession(), ['easy']);

    const opened = openToday(daily);

    expect(opened.session).toEqual({ ...daily.session, place: { kind: 'today' } });
    expect([opened.current, opened.date]).toEqual(['practice', TENTH_OF_NOVEMBER]);
  });
});
