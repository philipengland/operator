// Layer 3 contract — the route from a merged change to the public address.

/** The pipeline's publishing rules, described in plain names. */
export interface PublishingRoute {
  /** Branches whose changes can be published, e.g. "main". */
  readonly publishesFrom: readonly string[];
  /** Stages that must succeed before publishing, e.g. "build", "unit tests". */
  readonly mustSucceedFirst: readonly string[];
}

export interface DeliveryDriver {
  mergedVersion(): Promise<string>;
  versionAtPublicAddress(): Promise<string>;
  publishingRoute(): Promise<PublishingRoute>;
}
