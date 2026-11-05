// Layer 1 — User Story 3: anyone can open the game at a public address.

import { test } from '../support/acceptance';

test.describe('[spec-001 AC-17] a merged change goes live', { tag: '@after-publish' }, () => {
  test('once the pipeline finishes, the public address serves the merged version', async ({ delivery }) => {
    await delivery.expectPublicAddressServesMergedVersion();
  });
});

test.describe('[spec-001 AC-19] a failed change never goes live', () => {
  test('only changes merged to main are published', async ({ delivery }) => {
    await delivery.expectPublishingOnlyFrom(['main']);
  });

  test('publishing happens only after the build, unit tests and acceptance tests succeed', async ({ delivery }) => {
    await delivery.expectPublishingOnlyAfter(['build', 'unit tests', 'acceptance tests']);
  });
});
