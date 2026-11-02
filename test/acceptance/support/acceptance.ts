// Layer 3 — hands each scenario its DSLs, with drivers chosen by configuration
// (acceptance-tests standard "Choosing the Driver"):
//   ACCEPTANCE_DRIVER=engine (default)  in-process game driver, no browser
//   ACCEPTANCE_DRIVER=ui                Playwright game and phone drivers sharing one page

import { test as base } from '@playwright/test';
import { DeliveryDsl } from '../dsl/delivery.dsl';
import { GameDsl } from '../dsl/game.dsl';
import { PhoneDsl } from '../dsl/phone.dsl';
import { PipelineDeliveryDriver } from '../drivers/delivery/delivery.driver';
import { EngineGameDriver } from '../drivers/engine/game.engine-driver';
import type { PhoneDriver } from '../drivers/phone.driver';
import { UiGameDriver } from '../drivers/ui/game.ui-driver';
import { UiPhoneDriver } from '../drivers/ui/phone.ui-driver';

interface AcceptanceFixtures {
  readonly game: GameDsl;
  readonly phone: PhoneDsl;
  readonly delivery: DeliveryDsl;
}

export const isUiRun = process.env.ACCEPTANCE_DRIVER === 'ui';

function noPhoneInEngineRuns(): PhoneDriver {
  throw new Error('Scenarios that use the phone are tagged @ui and run only with ACCEPTANCE_DRIVER=ui.');
}

const delivery = async ({}, use: (dsl: DeliveryDsl) => Promise<void>) => {
  const driver = new PipelineDeliveryDriver();
  await use(new DeliveryDsl(() => driver));
};

const engineFixtures = base.extend<AcceptanceFixtures>({
  game: async ({}, use) => {
    const driver = new EngineGameDriver();
    await use(new GameDsl(() => driver));
  },
  phone: async ({}, use) => use(new PhoneDsl(noPhoneInEngineRuns)),
  delivery,
});

const uiFixtures = base.extend<AcceptanceFixtures>({
  game: async ({ page }, use) => {
    const driver = new UiGameDriver(page);
    await use(new GameDsl(() => driver));
  },
  phone: async ({ page }, use) => {
    const driver = new UiPhoneDriver(page);
    await use(new PhoneDsl(() => driver));
  },
  delivery,
});

export const test = isUiRun ? uiFixtures : engineFixtures;
