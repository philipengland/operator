// spec-007: the Today screen's props, worked out from today's puzzles (FR-701). Pure.

import type { TodayListProps } from '../ui/screens/today-list.model';
import { todayRows, type DailyState } from './daily';
import { BACK } from './solution-list';

const TODAY = 'Today';

export function todayListProps(state: DailyState): TodayListProps {
  return { heading: TODAY, backLabel: BACK, rows: todayRows(state) };
}
