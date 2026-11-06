import { defineConfig, devices } from '@playwright/test';

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

export default defineConfig({
  testDir: 'test/acceptance',
  testMatch: '**/*.acceptance-spec.ts',
  forbidOnly: isCi,
  // Retries only collect traces for diagnosis; a scenario that passes on retry is flaky
  // and is fixed, never accepted (Playwright standard).
  retries: isCi ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: isUiRun
    ? [
        {
          name: 'iphone',
          testIgnore: '**/delivery/**',
          grepInvert: /@budget|@after-publish|@catalogue/,
          use: { ...devices['iPhone SE'], viewport: PHONE_SCREEN },
        },
        {
          name: 'android',
          testIgnore: '**/delivery/**',
          grepInvert: /@after-publish|@catalogue/,
          use: { ...devices['Pixel 5'], viewport: PHONE_SCREEN },
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
        ]
      : undefined,
});
