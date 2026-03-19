# How To Change Things

## Required workflow

1. Analyze the request and identify the owning module.
2. List impacted neighboring modules and shared contracts.
3. Implement the smallest correct change in the right layer.
4. Add or update tests for rules, integration behavior, and exploit edges.
5. Update global docs and module docs in the same change.
6. Summarize risks, migration concerns, and follow-up work.

## Common change examples

- New crime formula: update `crime` domain rules, tests, balance catalog, and any affected stats or economy docs.
- New gang feature: update `gangs`, then document territory or notifications events if they consume it.
- New UI view: confirm backend contract exists first, then render data without moving rules into the client.
- Runtime/bootstrap change: prefer `apps/api/src/platform/*`, `apps/web/app/*`, shared contracts in `packages/*`, and update runtime setup docs in the same change.
