import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// catalogue.html's content security policy (default-src 'self') blocks the <style> tags Vite's
// dev server injects, so the catalogue lost every style and font under `vite` (found on a phone,
// 2026-11-07). Served from its build, its CSS is a file and loads.
describe('npm run catalogue', () => {
  it('builds the catalogue and serves the build, not the dev server', () => {
    const { scripts } = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };

    expect(scripts.catalogue).toMatch(/^vite build --mode catalogue && vite preview --outDir catalogue-dist\b/);
  });

  it('serves the game the same way for npm run dev, now it uses the library (spec-004)', () => {
    const { scripts } = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };

    expect(scripts.dev).toMatch(/^vite build && vite preview\b/);
  });
});
