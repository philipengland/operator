---
id: EXC-006
title: Web build hosted on GitHub Pages and built by GitHub Actions
status: active
deviates_from: "Baseline principle 4 — Platform Before Bespoke"
dimension: "Security"
risk_owner: "Philip England, solo developer and product owner"
approved_by: "Philip England, owner of the standards for this personal project (self-approved)"
raised: 2026-11-02
review_by: 2027-05-02
expires: 2027-11-02
---

## Reason

Operator is a personal project with no organisation Cloud Services / DevOps platform
behind it, and no approved list of platform capabilities exists. The repository lives on
GitHub, so GitHub Pages and GitHub Actions are the nearest thing to a platform: free
HTTPS static hosting and a managed pipeline, with no servers to run. The choice is recorded
in [ADR 0001](../adr/0001-web-stack-and-hosting.md).

## Mitigating controls

- Pages deploys use a short-lived OIDC token issued per run. No publishing secret is
  stored.
- Workflow permissions default to `contents: read`. `pages: write` and `id-token: write`
  are granted only to the deploy job, which never runs for pull requests.
- The `github-pages` environment accepts deployments from `main` only.
- Third-party actions are pinned to commit SHAs, and dependencies install with `npm ci`
  from the committed lockfile.
- The deploy job runs only after build, tests and acceptance scenarios pass, so a failed
  change never replaces the live site.
- The site is static, holds no data and makes no network calls after load.

## Exit plan

If Operator comes under an organisation with a platform offering static hosting and
pipelines, move to it and close this exception. Otherwise, review by 2027-05-02 and renew
before 2027-11-02, or publish an approved platform list for this project that names
GitHub Pages and Actions, which removes the need for this exception.
