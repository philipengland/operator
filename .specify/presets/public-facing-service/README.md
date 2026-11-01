# public-facing-service Preset

A domain overlay for products used directly by the public or by customers.
Install at priority 20, **in addition to** `org-baseline`. It appends five
principles to the constitution and never relaxes the baseline.

| File | Effect |
|---|---|
| `templates/constitution-public-facing.md` | P1 user needs first, P2 accessible by default (WCAG 2.2 AA, axe/pa11y), P3 performance and availability budgets, P4 privacy by design, P5 content and design consistency |
| `preset.yml` | Declares the template with `strategy: "append"` |

```bash
specify preset add --from <release-url>/public-facing-service-vX.Y.Z.zip --priority 20
# or: python scripts/init_project.py <project> --stack … --public-facing
```

This preset is also the pattern for new overlays — see
[`speckit/README.md`](../../README.md#adding-a-domain-overlay).
