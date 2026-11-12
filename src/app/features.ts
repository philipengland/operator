// The game's feature flags, fixed at build time (constitution VII, research R10). Releasing a
// story is one line here. There is no remote, URL or player-facing switch.

// Name each story's flag here while it is built, and remove it once it is released and signed off.
export interface Features {
  /** spec-007 User Story 1: today's Easy puzzle, the Today screen and Practice. */
  readonly daily: boolean;
  /** spec-007 User Story 2: today's Medium and Collector puzzles. */
  readonly presets: boolean;
  /** spec-007 User Story 3: today's Hard puzzle. */
  readonly hard: boolean;
  /** spec-007 User Story 4: a new day (reopening on the puzzle last played, and clearing earlier days). */
  readonly newDay: boolean;
}

export const RELEASED: Features = { daily: true, presets: true, hard: true, newDay: true };

// The Vite mode of the build that tests every story with its flag on (`npm run build:flags-on`).
export const FLAGS_ON_MODE = 'flags-on';

/** The features a build contains; the `flags-on` build tests every story before its release. */
export function featuresForBuild<Flags extends object>(mode: string, released: Flags): Flags {
  return mode === FLAGS_ON_MODE ? (Object.fromEntries(Object.keys(released).map((name) => [name, true])) as Flags) : released;
}
