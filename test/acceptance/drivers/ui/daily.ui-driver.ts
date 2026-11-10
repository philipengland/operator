// Layer 3 — today's puzzles on the phones, through Playwright (spec-007). Stubs until User Story 1 (task T024).

import type { DailyPuzzle, TodayRow } from '../../dsl/daily-vocabulary';
import type { DailyDriver } from '../daily.driver';

const NO_PUZZLE: DailyPuzzle = { heardAs: '', rows: 0, columns: 0, cells: [], rowLines: [], columnLines: [] };

export class UiDailyDriver implements DailyDriver {
  async setDate(): Promise<void> {}
  async tapToday(): Promise<void> {}
  async todayRows(): Promise<readonly TodayRow[]> {
    return [];
  }
  async tapTodayRow(): Promise<void> {}
  async puzzle(): Promise<DailyPuzzle> {
    return NO_PUZZLE;
  }
  async isWorkedExampleShowing(): Promise<boolean> {
    return false;
  }
  async counterTitle(): Promise<string> {
    return '';
  }
  async counter(): Promise<string> {
    return '';
  }
  async enterBuiltFromFillingAndCheck(): Promise<void> {}
  async enterSolutionsAndCheck(): Promise<void> {}
  async madeByTheEngineAlone(): Promise<DailyPuzzle> {
    return NO_PUZZLE;
  }
  async themeShown(): Promise<string> {
    return '';
  }
  async themeForThePuzzlesSeed(): Promise<string> {
    return '';
  }
  async secondsToOpen(): Promise<number> {
    return Number.NaN;
  }
}
