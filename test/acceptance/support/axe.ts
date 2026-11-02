// Layer 3 — the accessibility scan every UI-driver page goes through (Playwright standard).

import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa'];

export async function scanForAccessibilityProblems(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  if (violations.length === 0) {
    return;
  }
  const summary = violations
    .map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length} element(s))`)
    .join('\n');
  throw new Error(`Accessibility violations (WCAG 2.2 AA):\n${summary}`);
}
