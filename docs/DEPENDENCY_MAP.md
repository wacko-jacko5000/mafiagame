# Dependency Map

## Allowed direction

- `apps/web -> packages/types, packages/config`
- `apps/api -> packages/types, packages/config`
- `apps/api module -> other api modules only through documented contracts`
- `apps/api platform runtime -> apps/api platform runtime or shared packages`

## High-value module relationships

- `player` currently stands alone and owns persistent player foundation state until auth is introduced.
- `crime` owns crime rules and catalogs but routes persistent state mutation through the player module in this phase.
- `crime` depends on `jail` and `hospital` through application services for blocked-state checks and failed-crime consequences.
- `jail` and `hospital` own status rules, but their persistence currently lives on player-adjacent timestamp fields as the smallest correct step.
- `inventory` owns item catalogs and player-owned item persistence.
- `inventory` owns equipped-state rules on top of owned inventory rows.
- `inventory` may coordinate an atomic shop purchase with player cash through an explicit infrastructure transaction boundary; cash ownership still remains with `player`.
- `combat` reads equipped loadout projections from `inventory`, reads health from `player`, and may apply hospitalization through an explicit backend transaction boundary using hospital-owned rules.
- `gangs` owns gang, membership, and invite persistence, validates player existence through `player`, and does not embed gang state into player records.
- `territory` owns district, current-control, and district-war persistence, validates gang existence and leader claim authority through `gangs`, and does not own gang membership logic.
- `stats` provides derived state used by `crime`, `combat`, `jail`, and `hospital`.
- `economy` is upstream for `crime`, `businesses`, `market`, `missions`, and `territory` rewards.
- `inventory` supports `combat`, `crime`, `missions`, and `market`.
- `market` owns listing state, depends on `inventory` item ownership, and settles direct buyer/seller cash using explicit backend transaction boundaries while `player` remains the owner of cash state.
- `missions` now consumes explicit in-process domain events from `crime`, `inventory`, `combat`, and `territory` instead of direct progress-hook service calls.
- `achievements` consumes explicit in-process domain events from `crime`, `inventory`, `combat`, `territory`, and `market` instead of reaching into gameplay module internals.
- `market` now publishes explicit in-process sale events for future consumers while remaining synchronous and in-process.
- `gangs` and `territory` are tightly related but should stay split for independent evolution.
- `notifications` currently owns persistent player activity feed records and consumes explicit events from `market`, `territory`, `achievements`, and `gangs`.
- `leaderboard` owns public ranking definitions and reads existing persisted `player` and `achievements` state through its own repository instead of introducing a separate score pipeline in this phase.

## Dependency rules

- No module may read another module's database tables directly without an explicit infrastructure adapter and documented ownership reason.
- Shared formulas should move into the owning module or `packages/config`, not duplicated helpers.
- Prisma belongs to the API runtime and future infrastructure layers, not the web app.
