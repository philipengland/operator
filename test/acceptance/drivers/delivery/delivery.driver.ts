// Layer 3 — reads the pipeline's publishing rules and the version at the public address.
//   ACCEPTANCE_PUBLIC_URL   the public address to read, e.g. the Pages deployment URL
// The expected version is found the same way the build labels itself (tools/build-version.ts).

import { execSync } from 'node:child_process';
import { buildVersion } from '../../../../tools/build-version';
import type { DeliveryDriver, PublishingRoute } from '../delivery.driver';

const VERSION_META = /<meta\s+name="version"\s+content="([^"]*)"/;

export class PipelineDeliveryDriver implements DeliveryDriver {
  async mergedVersion(): Promise<string> {
    return buildVersion(process.env, () => execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim());
  }

  // Failures are reported as the version seen, so the scenario says what was found instead.
  async versionAtPublicAddress(): Promise<string> {
    const publicAddress = process.env.ACCEPTANCE_PUBLIC_URL;
    if (!publicAddress) {
      return 'no public address given (ACCEPTANCE_PUBLIC_URL)';
    }
    try {
      // A query the CDN has never seen, so it fetches the page as published, not a cached copy.
      const freshAddress = new URL(publicAddress);
      freshAddress.searchParams.set('check', String(Date.now()));
      const response = await fetch(freshAddress, { cache: 'no-store' });
      if (!response.ok) {
        return `nothing published (HTTP ${response.status} from ${publicAddress})`;
      }
      return (await response.text()).match(VERSION_META)?.[1] ?? 'page has no version';
    } catch (error) {
      return `public address unreachable (${String(error)})`;
    }
  }

  async publishingRoute(): Promise<PublishingRoute> {
    return { publishesFrom: [], mustSucceedFirst: [] };
  }
}
