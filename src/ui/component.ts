// The shape every component in the library shares (docs/contracts/component-library.md).

/** Writes text only when it changes (AGENTS.md: rewriting identical text re-announces it). */
export function writeText(target: Pick<Node, 'textContent'>, text: string): void {
  if (target.textContent !== text) {
    target.textContent = text;
  }
}
