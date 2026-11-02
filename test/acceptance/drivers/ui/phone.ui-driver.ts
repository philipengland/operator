// Layer 3 — the phone around the game: screen, connection, looks and speed.

import type { Page } from '@playwright/test';
import type { Box, CellLook, PhoneDriver, ScreenLayout } from '../phone.driver';

// Unknown positions: NaN compares false, so nothing unread can count as on screen.
const NO_BOX: Box = { left: Number.NaN, top: Number.NaN, right: Number.NaN, bottom: Number.NaN };

const EMPTY_LAYOUT: ScreenLayout = {
  screen: { width: 0, height: 0 },
  cells: { 'top-left': NO_BOX, 'top-right': NO_BOX, 'bottom-left': NO_BOX, 'bottom-right': NO_BOX },
  targets: { 'Row 1': NO_BOX, 'Row 2': NO_BOX, 'Column 1': NO_BOX, 'Column 2': NO_BOX },
  operators: { 'Row 1': NO_BOX, 'Row 2': NO_BOX, 'Column 1': NO_BOX, 'Column 2': NO_BOX },
  counter: NO_BOX,
  checkButton: NO_BOX,
};

export class UiPhoneDriver implements PhoneDriver {
  constructor(private readonly page: Page) {}

  async useScreen(): Promise<void> {}

  async useReferencePhoneOn4G(): Promise<void> {}

  async loseConnection(): Promise<void> {}

  async reload(): Promise<void> {}

  // Until this is built it reports the game as showing, so AC-21 cannot pass vacuously.
  async isGameShowing(): Promise<boolean> {
    return true;
  }

  async networkRequestsSinceOpening(): Promise<number> {
    return 0;
  }

  async look(): Promise<CellLook> {
    return { colours: '', markings: '' };
  }

  async layout(): Promise<ScreenLayout> {
    return EMPTY_LAYOUT;
  }

  async secondsUntilReadyToPlay(): Promise<number> {
    return Number.POSITIVE_INFINITY;
  }

  async tapResponseTimesInMilliseconds(): Promise<readonly number[]> {
    return [];
  }
}
