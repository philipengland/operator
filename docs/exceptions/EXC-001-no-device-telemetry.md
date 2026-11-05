---
id: EXC-001
title: The offline game sends no logs, metrics, traces or health checks from devices
status: active
deviates_from: "Baseline principle 7 — Observable and Testable by Design"
dimension: "Quality"
risk_owner: "Philip England, solo developer and product owner"
approved_by: "Philip England, owner of the standards for this personal project (self-approved)"
raised: 2026-11-02
review_by: 2027-05-02
expires: 2027-11-02
---

## Reason

Operator runs entirely on the player's device and makes no network calls after loading
(constitution I). Sending telemetry would need a collecting service, a network call and
a privacy declaration, which goes against the product's offline, no-data design
(Overlay P4). There is no server to emit telemetry from.

## Mitigating controls

- Every acceptance criterion is verified by an automated test in the pipeline, through an
  in-process driver and a browser driver on phone-sized viewports.
- Performance budgets (load time, tap response, bundle size) are measured in CI on every
  change.
- Accessibility is scanned automatically on every browser-driven page.
- Real-device, screen-reader and hallway playtest checks are done by hand before each
  feature is declared done, and recorded in the feature's TDD log.
- A post-deploy check confirms the public address serves the merged commit.
- No personal data is collected, so there is nothing to lose or leak.

## Exit plan

Review by 2027-05-02. When the first backend arrives (Phase 3, solution rarity), decide
whether opt-in, privacy-preserving telemetry is wanted. That needs its own spec and ADR.
Otherwise renew before 2027-11-02.
