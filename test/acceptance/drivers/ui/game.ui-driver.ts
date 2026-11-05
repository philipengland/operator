// Layer 3 — drives the game through a phone-sized browser page, locating elements only by
// role and accessible name (contracts/play-screen.md).

import type { Page } from '@playwright/test';
import { DEFAULT_VIEW } from '../default-view';
import type { GameDriver, GameView } from '../game.driver';

export class UiGameDriver implements GameDriver {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {}

  async tapCell(): Promise<void> {}

  async tapOperator(): Promise<void> {}

  async check(): Promise<void> {}

  async view(): Promise<GameView> {
    return DEFAULT_VIEW;
  }

  async announcementCount(): Promise<number> {
    return 0;
  }
}
