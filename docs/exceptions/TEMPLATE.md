---
# Copy to docs/exceptions/EXC-NNN-short-title.md in the product repository.
# Every exception has a named owner, an approver, a review date and an expiry.
id: EXC-001
title: Short description of the deviation
status: active                 # active | closed
deviates_from: "Baseline principle 2 — Clear Boundaries and Ownership"
dimension: "Code Health"        # optional: Quality | Security | Code Health
risk_owner: "Name, role"       # named owner at a seniority appropriate to the risk
approved_by: "Name, role"      # whoever owns the standards for this product
raised: 2026-10-25
review_by: 2027-01-25          # must be on or before expires
expires: 2027-04-25            # never indefinite; CI fails after this date
---

## Reason

Why the principle or standard cannot be met now (technically infeasible,
alternative mitigation in place, or remediation cost outweighs the risk).

## Mitigating controls

The controls in place for the duration of the exception.

## Exit plan

What will bring the component into line, and when.
