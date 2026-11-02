# Quickstart: Validate the Walking Skeleton (F0)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

How to prove F0 works, locally and once deployed. The commands below are the scripts
`/speckit-implement` adds to `package.json`.

## Prerequisites

- Node 22 LTS (`.nvmrc`).
- `npm ci`, then `npx playwright install --with-deps webkit chromium`.

## 1. Rules and session (Node, seconds)

```sh
npm run lint            # includes the engine boundary rules (research R2)
npm run typecheck       # app, plus the engine's DOM-free tsconfig
npm test                # Vitest unit tests with coverage
```

**Expected**: all green. Coverage is reported, and the threshold is enforced.

## 2. Acceptance through the engine driver (Node, seconds)

```sh
npm run test:acceptance                       # ACCEPTANCE_DRIVER=engine is the default
npm run test:acceptance -- -g "spec-001 AC-8" # one criterion
```

**Expected**: every scenario not tagged `@ui` passes. These cover AC-2, AC-3, AC-5 to
AC-16, and AC-20.

## 3. Acceptance through the UI driver (browser, about a minute)

```sh
npm run build
ACCEPTANCE_DRIVER=ui npm run test:acceptance
```

Playwright starts `vite preview` on `dist/` and runs every scenario in two projects:
WebKit with iPhone emulation and Chromium with Android emulation, at 375 × 667.

**Expected**:

- All AC-1 to AC-16, AC-18, AC-20 and AC-21 scenarios pass in both projects.
- Every visited page passes an axe scan (`wcag2a`, `wcag2aa`, `wcag22aa`).
- No network requests are recorded after load.
- In the Chromium project, the budget scenario reports ready-to-play under 3 s (4G,
  4× CPU slowdown) and tap-to-render under 100 ms.

## 4. Play it yourself

```sh
npm run dev
```

Open the printed address with the browser's phone emulation (375 × 667) and walk through
it:

1. You see the 6 in the top-left cell, targets 8 and 6 on the left, 3 and 6 on top, and
   "Found 0 of 2".
2. Tap top-right twice to get 2. Tap bottom-left twice to get 2. Tap bottom-right three
   times to get 3.
3. Tap Row 2's operator three times (×) and Column 1's four times (÷). Then tap **Check**.
   You see a new-solution message and "Found 1 of 2".
4. Tap bottom-left once (3). The message disappears. Tap Row 2's operator twice (÷ then +)
   and Column 1's twice (+ then −). Tap **Check**. You see the all-found message and
   "Found 2 of 2".

## 5. After deploy (pipeline, automatic)

Merging to `main` runs `.github/workflows/ci-deploy.yml`.

**Expected**:

- The `deploy` job runs only after `verify` passes.
- The smoke step confirms `<meta name="version">` at the public address equals the merged
  commit SHA (AC-17).
- The merge-to-live time shown on the run is under 15 minutes (SC-005).

## 6. Manual checks before declaring F0 done

Emulation does not replace real devices (research R5). Record the results in
`specs/001-walking-skeleton/tdd-log.md`.

| Check | Device | Pass when |
| --- | --- | --- |
| SC-002 | Real iPhone, current Safari; real Android phone, current Chrome | Steps in section 4 work, nothing sits under the notch or home indicator. |
| SC-006 | iPhone with VoiceOver; Android with TalkBack | Solution A can be found with the screen reader alone, and results are announced. |
| AC-18 | Either phone | Load the game, switch on airplane mode, find Solution A. |
| AC-19 | Pipeline | After the first failing `verify` run on `main`, the public address still serves the previous version. |
| SC-001 | 5 hallway playtesters | At least 4 find a solution within 3 minutes with no help. |
