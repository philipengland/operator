// Layer 2 — getting a merged change to players at the public address.

import { expect } from '@playwright/test';
import type { DeliveryDriver } from '../drivers/delivery.driver';

export class DeliveryDsl {
  constructor(private readonly driver: () => DeliveryDriver) {}

  async expectPublicAddressServesMergedVersion(): Promise<void> {
    const merged = await this.driver().mergedVersion();
    expect(await this.driver().versionAtPublicAddress(), 'version at the public address').toBe(merged);
  }

  async expectPublishingOnlyFrom(branches: readonly string[]): Promise<void> {
    const route = await this.driver().publishingRoute();
    expect([...route.publishesFrom].sort(), 'branches that can publish').toEqual([...branches].sort());
  }

  async expectPublishingOnlyAfter(stages: readonly string[]): Promise<void> {
    const route = await this.driver().publishingRoute();
    for (const stage of stages) {
      expect(route.mustSucceedFirst, `"${stage}" must succeed before publishing`).toContain(stage);
    }
  }
}
