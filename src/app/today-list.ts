// spec-007: the Today screen's props, worked out from today's puzzles (FR-701). Pure.

import type { TodayListProps } from '../ui/screens/today-list.model';
import { todayRows, type DailyState } from './daily';
import { BACK } from './solution-list';
import type { PresetName } from '../engine';
import type { Features } from './features';

const TODAY = 'Today';

export function todayListProps(state: DailyState): TodayListProps {
  return { heading: TODAY, backLabel: BACK, rows: todayRows(state) };
}

/** Today's presets each released story offers, in the Today screen's order (research R11). */
export function presetsOffered({ daily, presets }: Features): readonly PresetName[] {
  if (!daily) {
    return [];
  }
  return presets ? ['easy', 'medium', 'collector'] : ['easy'];
}
