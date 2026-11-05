// Layer 3 — reads the pipeline's publishing rules and the version at the public address.
//   ACCEPTANCE_PUBLIC_URL   the public address to read, e.g. the Pages deployment URL
// The expected version is found the same way the build labels itself (tools/build-version.ts).

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { buildVersion } from '../../../../tools/build-version';
import type { DeliveryDriver, PublishingRoute } from '../delivery.driver';

const VERSION_META = /<meta\s+name="version"\s+content="([^"]*)"/;
const PIPELINE_FILE = '.github/workflows/ci-deploy.yml';
const PUBLISH_ACTION = 'actions/deploy-pages@';
const BRANCH_CONDITION = /github\.ref\s*==\s*'refs\/heads\/([^']+)'/g;

// The pipeline's commands, in the plain names the scenarios use.
const STAGE_COMMANDS: readonly (readonly [RegExp, string])[] = [
  [/^npm run build\b/, 'build'],
  [/^npm test\b/, 'unit tests'],
  [/^npm run test:acceptance\b/, 'acceptance tests'],
];

interface Step {
  readonly run?: string;
  readonly uses?: string;
  readonly if?: string;
  readonly 'continue-on-error'?: boolean;
}

interface Job {
  readonly needs?: string | readonly string[];
  readonly if?: string;
  readonly steps?: readonly Step[];
}

interface Pipeline {
  readonly on?: Readonly<Record<string, { readonly branches?: readonly string[] } | null>>;
  readonly jobs?: Readonly<Record<string, Job>>;
}

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
    const pipeline = parse(readFileSync(PIPELINE_FILE, 'utf8')) as Pipeline;
    const jobs = pipeline.jobs ?? {};
    const publishJob = Object.values(jobs).find((job) => job.steps?.some((step) => step.uses?.startsWith(PUBLISH_ACTION)));
    if (!publishJob) {
      return { publishesFrom: [], mustSucceedFirst: [] };
    }
    return {
      publishesFrom: branchesThatCanPublish(pipeline, publishJob),
      mustSucceedFirst: stagesBefore(publishJob, jobs),
    };
  }
}

/**
 * The branches named by the publishing job's condition. Without a condition it publishes
 * from whatever starts the pipeline, which is described as such so the scenario shows it.
 */
function branchesThatCanPublish(pipeline: Pipeline, publishJob: Job): readonly string[] {
  const condition = publishJob.if ?? '';
  if (condition.includes('||')) {
    return [`unclear condition: ${condition}`];
  }
  const branches = [...condition.matchAll(BRANCH_CONDITION)].map((match) => match[1] ?? '');
  if (branches.length > 0) {
    return branches;
  }
  return Object.entries(pipeline.on ?? {}).flatMap(([trigger, settings]) => settings?.branches ?? [`any branch (${trigger})`]);
}

/** The stages in every job the publishing job waits for, directly or through another job. */
function stagesBefore(publishJob: Job, jobs: Readonly<Record<string, Job>>): readonly string[] {
  const stages = new Set<string>();
  const waitingFor = [...asList(publishJob.needs)];
  const seen = new Set<string>();
  for (let name = waitingFor.pop(); name !== undefined; name = waitingFor.pop()) {
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);
    const job = jobs[name];
    waitingFor.push(...asList(job?.needs));
    stagesIn(job).forEach((stage) => stages.add(stage));
  }
  return [...stages];
}

/** A step counts only if it always runs and its failure stops the job. */
function stagesIn(job: Job | undefined): readonly string[] {
  return (job?.steps ?? [])
    .filter((step) => step.if === undefined && step['continue-on-error'] !== true)
    .flatMap((step) => STAGE_COMMANDS.filter(([command]) => command.test(step.run?.trim() ?? '')).map(([, stage]) => stage));
}

function asList(needs: string | readonly string[] | undefined): readonly string[] {
  if (needs === undefined) {
    return [];
  }
  return typeof needs === 'string' ? [needs] : needs;
}
