---
description: HTTP API design conventions — contracts, URLs, versioning, errors (RFC 9457), pagination, data formats
applyTo: '**/*Controller.cs,**/Contracts/**/*.cs,**/*.controller.ts,**/*.dto.ts,**/openapi*.yaml,**/openapi*.yml,**/openapi*.json'
---
<!-- engineering-standards v2.0.0: managed file — do not edit in this repository. Changes go to the engineering-standards repo. -->

# HTTP API Design Standards

Applies to every HTTP API in .NET or NestJS. Supports constitution principle 3
(contract-first integration).

## Contract First

**The OpenAPI document is the contract and is written or updated before the implementation.**
*Why: consumers and reviewers see the change before it ships; breaking changes are caught early.*

- Store it in the repository (e.g. `contracts/openapi.yaml`). Changing it is a
  public-contract change: it needs a spec and explicit instruction.
- Keep generated and hand-written contracts in agreement; the build should
  fail if they diverge.

## URLs and Methods

- Resources are plural nouns in kebab-case: `/v1/funding-applications/{id}`.
- Use HTTP methods for their meaning: `GET` reads (safe), `POST` creates or
  triggers, `PUT` replaces, `PATCH` partially updates, `DELETE` removes.
- No verbs in paths except for genuine actions that are not CRUD:
  `POST /v1/funding-applications/{id}/submit`.

## Versioning

**Version in the URL path (`/v1/`), and only for breaking changes.**
*Why: explicit, visible and easy to route.*

- Additive changes (new optional fields, new endpoints) do not need a new
  version. Consumers must ignore unknown fields.
- Breaking changes (removing or renaming fields, changing types or meaning,
  new required inputs) need a new version, a migration path and a deprecation
  date for the old one.

## Errors — RFC 9457 Problem Details

**Every error response uses `application/problem+json`.**
*Why: one predictable error shape across all services.*

```json
{
  "type": "https://example.com/problems/validation",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "detail": "The request contains invalid fields.",
  "instance": "/v1/funding-applications",
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  "errors": { "localAuthorityCode": ["Must be a valid ONS code."] }
}
```

- Include `traceId` so support can find the request in telemetry.
- Never include stack traces, exception messages, SQL or internal hostnames.
- Status codes: `400` invalid input, `401` unauthenticated, `403` not
  permitted, `404` not found (also used when the caller may not know the
  resource exists), `409` conflict, `422` valid syntax but rule violation,
  `500` unexpected.

## Collections and Pagination

**Every collection endpoint is paginated, with a maximum page size.**
*Why: unbounded lists become outages as data grows.*

- Query: `?page=1&pageSize=25` (default 25, maximum 100).
- Response body:

```json
{ "items": [ ], "page": 1, "pageSize": 25, "totalCount": 312 }
```

- Filtering and sorting use query parameters: `?status=submitted&sort=-submittedAt`.

## Data Formats

- JSON property names are `camelCase`.
- Dates and times are ISO 8601 in UTC with `Z` (`2026-10-25T09:30:00Z`); dates
  without time are `YYYY-MM-DD`.
- Money is a decimal string or integer minor units with an explicit currency —
  never a floating-point number.
- Identifiers are opaque strings to consumers (GUIDs or similar), not
  sequential database keys.

## Security

- Every endpoint requires authentication unless the spec explicitly says
  otherwise. Authorisation is checked per operation and per record.
  `[Security]`
- Do not put personal data or secrets in URLs or query strings — they end up
  in logs.
