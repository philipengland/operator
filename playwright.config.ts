import { defineConfig, devices } from '@playwright/test';
import { RELEASED, type Features } from './src/app/features';

// Driver choice is configuration only (acceptance-tests standard "Choosing the Driver"):
//   npm run test:acceptance:engine   in-process, no browser
//   npm run test:acceptance:ui       iPhone (WebKit) and Android (Chromium) at 375 × 667
//   ACCEPTANCE_PUBLIC_URL=… npm run test:acceptance:engine   the published game (AC-17)
const isUiRun = process.env.ACCEPTANCE_DRIVER === 'ui';
const isAfterPublishRun = !!process.env.ACCEPTANCE_PUBLIC_URL;
const isCi = !!process.env.CI;
const PREVIEW_PORT = 4173;
const baseURL = process.env.ACCEPTANCE_BASE_URL ?? `http://localhost:${PREVIEW_PORT}`;
const PHONE_SCREEN = { width: 375, height: 667 }; // SC-002
// spec-003 research R8: the component catalogue is its own build, served on its own port, and
// browsed only by the @catalogue scenarios on their own phone projects.
const CATALOGUE_PORT = 4174;
const catalogueURL = `http://localhost:${CATALOGUE_PORT}/`;

// A scenario that enters two whole solutions makes about 700 browser calls: 8 seconds alone, but
// 30 or more in a full parallel run, so spec-001 AC-12 sometimes ran out of Playwright's default
// 30 seconds (2026-11-07 and -08, from its kept trace). A stuck scenario still fails, just later.
const SCENARIO_TIME_LIMIT_MS = 60_000;

// Constitution VII: which scenarios need a flag on, by file, so releasing a story changes no locked
// file. While a flag is off, its file runs only on the flags-on phones; once on, on the game's.
const SCENARIOS_BEHIND_A_FLAG: Readonly<Record<keyof Features, string>> = {
};
const unreleasedScenarios = (Object.keys(SCENARIOS_BEHIND_A_FLAG) as (keyof Features)[])
  .filter((flag) => !RELEASED[flag])
  .map((flag) => SCENARIOS_BEHIND_A_FLAG[flag]);
const FLAGS_ON_PORT = 4175;
const flagsOnURL = `http://localhost:${FLAGS_ON_PORT}/`;
const onTheGamesPhones = ['**/delivery/**', ...unreleasedScenarios];

export default defineConfig({
  testDir: 'test/acceptance',
  timeout: SCENARIO_TIME_LIMIT_MS,
  testMatch: '**/*.acceptance-spec.ts',
  forbidOnly: isCi,
  // Retries only collect traces for diagnosis; a scenario that passes on retry is flaky
  // and is fixed, never accepted (Playwright standard).
  retries: isCi ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    // CI retries, so it records a trace on the retry. Local runs do not retry, so they keep the
    // trace of any failure instead: a one-off failure can then be diagnosed (spec-001 AC-12
    // failed once on the iPhone, 2026-11-07, and could not be reproduced).
    trace: isCi ? 'on-first-retry' : 'retain-on-failure',
  },
  projects: isUiRun
    ? [
        {
          name: 'iphone',
          testIgnore: onTheGamesPhones,
          grepInvert: /@budget|@after-publish|@catalogue/,
          use: { ...devices['iPhone SE'], viewport: PHONE_SCREEN },
        },
        {
          name: 'android',
          testIgnore: onTheGamesPhones,
          grepInvert: /@budget|@after-publish|@catalogue/,
          use: { ...devices['Pixel 5'], viewport: PHONE_SCREEN },
        },
        ...(unreleasedScenarios.length === 0
          ? []
          : [
              {
                name: 'iphone-flagged',
                testMatch: unreleasedScenarios,
                grepInvert: /@budget|@after-publish|@catalogue/,
                use: { ...devices['iPhone SE'], viewport: PHONE_SCREEN, baseURL: flagsOnURL },
              },
              {
                name: 'android-flagged',
                testMatch: unreleasedScenarios,
                grepInvert: /@budget|@after-publish|@catalogue/,
                use: { ...devices['Pixel 5'], viewport: PHONE_SCREEN, baseURL: flagsOnURL },
              },
            ]),
        {
          // The speed budgets time real taps, so they run alone, after the others and with no
          // trace recording: run alongside them, they measured the machine's load (a tap of
          // 112.5 ms in one full run in four, 2026-11-08). Android only: see AGENTS.md.
          name: 'android-speed',
          testIgnore: '**/delivery/**',
          grep: /@budget/,
          dependencies: ['iphone', 'android', 'catalogue-iphone', 'catalogue-android'],
          use: { ...devices['Pixel 5'], viewport: PHONE_SCREEN, trace: 'off' },
        },
        {
          name: 'catalogue-iphone',
          grep: /@catalogue/,
          use: { ...devices['iPhone SE'], viewport: PHONE_SCREEN, baseURL: catalogueURL },
        },
        {
          name: 'catalogue-android',
          grep: /@catalogue/,
          use: { ...devices['Pixel 5'], viewport: PHONE_SCREEN, baseURL: catalogueURL },
        },
      ]
    : isAfterPublishRun
      ? [
          {
            // AC-17: reads the public address after deployment; no browser needed.
            name: 'after-publish',
            grep: /@after-publish/,
          },
        ]
      : [
          {
            name: 'engine',
            grepInvert: /@ui|@after-publish/,
          },
        ],
  webServer:
    isUiRun && !process.env.ACCEPTANCE_BASE_URL
      ? [
          {
            // Serves the built dist/ artifact: the same files that are deployed (research R5).
            command: `npm run preview -- --port ${PREVIEW_PORT} --strictPort`,
            url: baseURL,
            reuseExistingServer: !isCi,
          },
          {
            // Builds and serves the catalogue itself, so the pipeline needs no extra step.
            command: `npm run build:catalogue && npx vite preview --outDir catalogue-dist --port ${CATALOGUE_PORT} --strictPort`,
            url: `${catalogueURL}catalogue.html`,
            reuseExistingServer: !isCi,
          },
          {
            // Builds and serves the game with every flag on, for the scenarios behind a flag.
            command: `npm run build:flags-on && npx vite preview --outDir dist-flags-on --port ${FLAGS_ON_PORT} --strictPort`,
            url: flagsOnURL,
            reuseExistingServer: !isCi,
          },
        ]
      : undefined,
});
