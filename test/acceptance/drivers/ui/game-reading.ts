// Layer 3 — reads the game's screen in one browser call (spec-004 T016). Reading each name
// separately took about 29 calls per look and made long scenarios run out of time under load (#17).

export interface GameScreen {
  /** Every button in the puzzle, by its accessible name. */
  readonly buttons: readonly string[];
  /** Every piece of text on the screen, except the status region's. */
  readonly texts: readonly string[];
  readonly status: string;
}

/** Runs in the page. */
export function readGameScreen(): GameScreen {
  const puzzle = document.querySelector('[role="group"][aria-label="Puzzle"]');
  const status = document.querySelector('[role="status"]');
  const buttons = Array.from(puzzle?.querySelectorAll('button') ?? [], (button) => button.getAttribute('aria-label') ?? button.textContent ?? '');
  const texts = Array.from(document.querySelectorAll('main *'))
    .filter((element) => element.children.length === 0 && !status?.contains(element))
    .map((element) => element.textContent ?? '')
    .filter((text) => text !== '');
  return { buttons, texts, status: status?.textContent ?? '' };
}
