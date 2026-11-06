// Layer 3 — the files the game's build publishes (dist/), for spec-003 AC-18. Shared by the
// engine and UI catalogue drivers: reading the build needs no browser.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PublishedFile } from './catalogue.driver';

const PUBLISHED_FOLDER = 'dist';
const CATALOGUE_WORD = /catalogue/i;

export function publishedFiles(): readonly PublishedFile[] {
  if (!existsSync(PUBLISHED_FOLDER)) {
    return [];
  }
  return readdirSync(PUBLISHED_FOLDER, { recursive: true, encoding: 'utf8' })
    .map((name) => join(PUBLISHED_FOLDER, name))
    .filter((path) => !isFolder(path))
    .map((path) => ({ path, mentionsCatalogue: CATALOGUE_WORD.test(path) || CATALOGUE_WORD.test(readFileSync(path, 'latin1')) }));
}

function isFolder(path: string): boolean {
  try {
    readdirSync(path);
    return true;
  } catch {
    return false;
  }
}
