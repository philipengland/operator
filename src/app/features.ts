// The game's feature flags, fixed at build time (constitution VII, research R10). Releasing a
// story is one line here. There is no remote, URL or player-facing switch.

export interface Features {
  readonly voice: boolean;
}

export const RELEASED: Features = { voice: true };

// The Vite mode of the build that tests every story with its flag on (`npm run build:flags-on`).
export const FLAGS_ON_MODE = 'flags-on';

const EVERY_FEATURE: Features = { voice: true };

/** The features a build contains; the `flags-on` build tests every story before its release. */
export function featuresForBuild(mode: string, released: Features): Features {
  return mode === FLAGS_ON_MODE ? EVERY_FEATURE : released;
}
