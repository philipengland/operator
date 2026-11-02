// Layer 3 — fixtures that hand each scenario its DSLs.
// No drivers exist yet, so every fixture fails with a clear reason. /speckit-implement
// replaces this with driver selection (ACCEPTANCE_DRIVER=engine | ui).

import { test as base } from '@playwright/test';
import { DeliveryDsl } from '../dsl/delivery.dsl';
import { GameDsl } from '../dsl/game.dsl';
import { PhoneDsl } from '../dsl/phone.dsl';

interface AcceptanceFixtures {
  readonly game: GameDsl;
  readonly phone: PhoneDsl;
  readonly delivery: DeliveryDsl;
}

function driverNotBuilt(name: string): never {
  throw new Error(`No ${name} driver yet. /speckit-implement builds it.`);
}

export const test = base.extend<AcceptanceFixtures>({
  game: async ({}, use) => use(new GameDsl(() => driverNotBuilt('game'))),
  phone: async ({}, use) => use(new PhoneDsl(() => driverNotBuilt('phone'))),
  delivery: async ({}, use) => use(new DeliveryDsl(() => driverNotBuilt('delivery'))),
});
