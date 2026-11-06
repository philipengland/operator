import { execSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { defineConfig, type Plugin } from 'vite';
import { buildVersion } from './tools/build-version.ts';

// Research R9: JavaScript and CSS together stay under 30 KB gzipped, protecting the
// 3-second ready-to-play budget (SC-004).
const BUNDLE_BUDGET_BYTES = 30 * 1024;

/** Writes the commit into <meta name="version"> so the post-deploy check can read it (AC-17). */
function versionMeta(): Plugin {
  const version = buildVersion(process.env, () => execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim());
  return {
    name: 'operator-version-meta',
    transformIndexHtml: (html) => html.replace('%OPERATOR_VERSION%', version),
  };
}

/** Fails the build when the shipped JavaScript and CSS exceed the budget. */
function bundleBudget(): Plugin {
  return {
    name: 'operator-bundle-budget',
    apply: 'build',
    generateBundle(_options, bundle) {
      let gzippedBytes = 0;
      for (const output of Object.values(bundle)) {
        if (!/\.(js|css)$/.test(output.fileName)) {
          continue;
        }
        const source = output.type === 'chunk' ? output.code : output.source;
        gzippedBytes += gzipSync(source).length;
      }
      if (gzippedBytes > BUNDLE_BUDGET_BYTES) {
        this.error(`Bundle is ${gzippedBytes} bytes gzipped; the budget is ${BUNDLE_BUDGET_BYTES} (research R9).`);
      }
    },
  };
}

// spec-003 research R7: the component catalogue is a separate build. Only `vite build --mode
// catalogue` includes catalogue.html, and it writes to catalogue-dist/, so the game's dist/ never
// contains it.
const CATALOGUE_MODE = 'catalogue';

export default defineConfig(({ mode }) =>
  mode === CATALOGUE_MODE
    ? {
        base: './',
        build: {
          outDir: 'catalogue-dist',
          emptyOutDir: true,
          rollupOptions: { input: 'catalogue.html' },
        },
      }
    : {
        // Relative paths work under the GitHub Pages sub-path and inside Capacitor (research R7).
        base: './',
        build: {
          outDir: 'dist',
          emptyOutDir: true,
        },
        plugins: [versionMeta(), bundleBudget()],
      },
);
