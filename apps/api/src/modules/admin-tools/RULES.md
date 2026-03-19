# Admin Tools Rules

- Privileged actions must be explicitly gated and must fail closed when admin access is not configured.
- Admin tooling may request domain changes but should not bypass owning module rules.
- Balance updates are limited to explicit sections and fields; there is no generic edit-anything engine.
- Successful balance updates must write a minimal audit entry with previous and new values.
- Strong operator identity, audit reasons, and ticket references are intentionally deferred to later phases.
