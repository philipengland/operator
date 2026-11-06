# TDD Log — Themed Component Library (spec-003)

- **Spec**: `specs/003-themed-ui/spec.md`
- **Acceptance**: `specs/003-themed-ui/acceptance.md` (approved by Philip England, 2026-11-06)
- **Baseline**: 2026-11-06, branch `003-themed-ui-part-1` at `main` `7235b69` plus the part-1
  documents and scenarios:
  - `npm run lint`, `npm run typecheck`: clean.
  - `npm test`: 125 unit tests passing; coverage lines 100%, branches 95.97%.
  - `npm run build`: passes, bundle within budget.
  - Engine acceptance: 35 passed (every spec-001 and spec-002 scenario).
  - Phone acceptance: 87 passed (every spec-001 and spec-002 scenario); 34 failed: the 17
    approved spec-003 scenarios in `test/acceptance/library/simple-components.acceptance-spec.ts`
    on both phones, each with "The catalogue driver is not built yet (spec-003,
    /speckit-implement)". This is the approved RED state, not a failing baseline.

## Setup (part 1)

- **T001**: branch `003-themed-ui-part-1` from `main` after PR #8 merged; part-1 files brought from
  `003-themed-ui` (only the simple-components scenario file). Commit `docs(spec-003): …`.
- **T002**: this log and the baseline above.
- **T003, T004**: ADR 0002 and `docs/contracts/component-library.md`, linked from `AGENTS.md`.
- **T005**: fonts downloaded from Google Fonts on 2026-11-06 (sources and SHA-256 in
  `src/ui/foundations/fonts/README.md`): `chewy-400.woff2` 19,920 bytes; `nunito-variable.woff2`
  39,128 bytes (one variable file covers 700 and 800). **Found**: Chewy is under the Apache
  License 2.0, not the SIL OFL as spec, plan, research and ADR assumed; Nunito is OFL. Both
  allow bundling with their licence texts, which are committed. Documents corrected; raised
  with the owner at the next checkpoint.
