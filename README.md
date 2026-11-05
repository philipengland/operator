# Operator

A number puzzle for phones. Fill the grid with digits 1–9 so that every row and column
reaches the target beside it, using that line's operator (+, −, × or ÷). Most puzzles have
several answers, and the game counts how many different ones you find.

**Play it:** https://philipengland.github.io/operator/

The current release is F0, the walking skeleton: one fixed 2 × 2 puzzle, played in a phone
browser and working offline once loaded. See [specs/001-walking-skeleton/](specs/001-walking-skeleton/).

## Stack

TypeScript and Vite, unit tests in Vitest, acceptance tests through Playwright, hosted on
GitHub Pages and deployed by GitHub Actions. The reasons are in
[ADR 0001](docs/adr/0001-web-stack-and-hosting.md).

## Run, test and play

You need Node 22 (see `.nvmrc`).

```bash
npm ci
npx playwright install --with-deps webkit chromium   # once, for the browser tests
npm run dev                  # play it at http://localhost:5173
npm test                     # unit tests, with coverage
npm run build                # the static site in dist/
npm run test:acceptance      # acceptance tests: engine driver, then iPhone and Android on dist/
```

[quickstart.md](specs/001-walking-skeleton/quickstart.md) walks through every check, including
what to expect from each and the manual checks on real phones.

## How it is built

- Every change starts from a spec in [specs/](specs/), and the acceptance tests for it are
  approved before any code is written. They are then locked.
- Work is test-first. [tdd-log.md](specs/001-walking-skeleton/tdd-log.md) records each step.
- Pull requests are checked by the `verify` job. Merges to `main` deploy automatically.
- [AGENTS.md](AGENTS.md) holds the context for AI coding agents, and the principles are in
  [the constitution](.specify/memory/constitution.md).
- Recorded exceptions to the organisation baseline are in [docs/exceptions/](docs/exceptions/).
