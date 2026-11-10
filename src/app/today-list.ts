// spec-007: the Today screen's props, worked out from today's puzzles (FR-701). Pure.

import type { TodayListProps } from '../ui/screens/today-list.model';
import type { DailyState } from './daily';

export const todayListProps: (state: DailyState) => TodayListProps = () => ({ heading: '', backLabel: '', rows: [] });
