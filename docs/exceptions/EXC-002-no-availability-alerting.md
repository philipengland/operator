---
id: EXC-002
title: No availability targets are alerted on, because there is no service to monitor
status: active
deviates_from: "Public-Facing Service Overlay P3 — Performance And Availability Budgets"
dimension: "Quality"
risk_owner: "Philip England, solo developer and product owner"
approved_by: "Philip England, owner of the standards for this personal project (self-approved)"
raised: 2026-11-02
review_by: 2027-05-02
expires: 2027-11-02
---

## Reason

The web build is static files on GitHub Pages, and the packaged apps run on the device.
There is no running service whose availability could be measured and alerted on. The
performance part of Overlay P3 still applies: each spec declares on-device budgets, and
the pipeline checks them.

## Mitigating controls

- Hosting is GitHub's static content delivery network, served over HTTPS.
- Once loaded, the game needs no connection to play.
- The post-deploy step checks that the public address serves the merged commit, so a
  failed deploy is seen on the pipeline run.
- A failed build or test never replaces the live site.
- Rollback is a redeploy of the previous commit (see the feature plan's Deployment and
  Rollback section).

## Exit plan

Review by 2027-05-02. When the first backend arrives (Phase 3), that service gets
availability targets and alerting, and this exception narrows to the static web build.
Otherwise renew before 2027-11-02.
