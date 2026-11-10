import { describe, expect, it } from 'vitest';
import { dateOnThePhone } from './today';

describe('dateOnThePhone', () => {
  it("is the phone's own calendar date, as YYYY-MM-DD, whatever the time of day (spec-007 FR-716)", () => {
    const justAfterMidnight = new Date(2026, 10, 10, 0, 1);
    const justBeforeMidnight = new Date(2026, 0, 5, 23, 59);

    expect([dateOnThePhone(justAfterMidnight), dateOnThePhone(justBeforeMidnight)]).toEqual(['2026-11-10', '2026-01-05']);
  });
});
