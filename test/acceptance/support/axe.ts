// Layer 3 — the accessibility scan every UI-driver page goes through (Playwright standard).

import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa'];

/** Every WCAG 2.2 AA problem axe finds on the page as it is now, one line each. */
export async function accessibilityProblems(page: Page): Promise<readonly string[]> {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return violations.map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length} element(s))`);
}

export async function scanForAccessibilityProblems(page: Page): Promise<void> {
  const problems = await accessibilityProblems(page);
  if (problems.length > 0) {
    throw new Error(`Accessibility violations (WCAG 2.2 AA):\n${problems.join('\n')}`);
  }
}
