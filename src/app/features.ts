// The game's feature flags, fixed at build time (constitution VII, research R10). Releasing a
// story is one line here. There is no remote, URL or player-facing switch.

// No story is behind a flag at present. Name each one here while it is built, and remove it once
// it is released and signed off. To read one in the game, declare __OPERATOR_FEATURES__ in main.ts.
export type Features = Readonly<Record<never, boolean>>;

export const RELEASED: Features = {};

// The Vite mode of the build that tests every story with its flag on (`npm run build:flags-on`).
export const FLAGS_ON_MODE = 'flags-on';

/** The features a build contains; the `flags-on` build tests every story before its release. */
export function featuresForBuild(mode: string, released: Features): Features {
  return mode === FLAGS_ON_MODE ? Object.fromEntries(Object.keys(released).map((name) => [name, true])) : released;
}
