import { defineConfig } from '@playwright/test';

// Minimal configuration so the acceptance scenarios can run. /speckit-implement adds the
// iPhone-WebKit and Android-Chromium projects, driver selection and the preview server.
export default defineConfig({
  testDir: 'test/acceptance',
  testMatch: '**/*.acceptance-spec.ts',
  forbidOnly: !!process.env.CI,
  reporter: 'list',
});
