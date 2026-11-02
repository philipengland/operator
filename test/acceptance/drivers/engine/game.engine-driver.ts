// Layer 3 — drives the play session in-process, with no browser.

import { DEFAULT_VIEW } from '../default-view';
import type { GameDriver, GameView } from '../game.driver';

export class EngineGameDriver implements GameDriver {
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
