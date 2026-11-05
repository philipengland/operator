// Layer 3 — reads the pipeline's publishing rules and the version at the public address.

import type { DeliveryDriver, PublishingRoute } from '../delivery.driver';

export class PipelineDeliveryDriver implements DeliveryDriver {
  async mergedVersion(): Promise<string> {
    return '';
  }

  async versionAtPublicAddress(): Promise<string> {
    return '';
  }

  async publishingRoute(): Promise<PublishingRoute> {
    return { publishesFrom: [], mustSucceedFirst: [] };
  }
}
