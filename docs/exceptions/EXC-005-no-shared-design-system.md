---
id: EXC-005
title: No shared design system exists for this personal project
status: active
deviates_from: "Public-Facing Service Overlay P5 — Content And Design Consistency"
dimension: "Quality"
risk_owner: "Philip England, solo developer and product owner"
approved_by: "Philip England, owner of the standards for this personal project (self-approved)"
raised: 2026-11-02
review_by: 2027-05-02
expires: 2027-11-02
---

## Reason

Overlay P5 asks user-facing changes to use the shared design system and pass content
review. Operator is a personal project with no organisation, so there is no shared design
system to use and no separate content reviewer. A general-purpose design system would also
be a poor fit for a game grid.

## Mitigating controls

- Colours, spacing, type sizes and touch-target sizes are kept as a small set of design
  values (CSS custom properties) in one stylesheet, so screens stay consistent.
- Accessibility is enforced instead of left to a design system: WCAG 2.2 AA, automated axe
  scans on every browser-driven page, 48 × 48 px touch targets, and no meaning conveyed by
  colour alone.
- On-screen wording follows the spec and the approved acceptance scenarios. The owner
  reviews the wording in each pull request.

## Exit plan

Turn the stylesheet's design values into Operator's own documented design system when the
number of screens grows (expected around F5, solution log, or F6, presets), then close this
exception. Review by 2027-05-02; renew before 2027-11-02 if that has not happened.
