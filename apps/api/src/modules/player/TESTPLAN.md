# Player Test Plan

- Unit: creation defaults and display name validation.
- Unit: creation defaults, display name validation, respect threshold progression derivation, and max-level handling.
- Application: duplicate-name rejection, lazy energy regeneration, resource projection, and custody timestamp updates.
- API: create player, fetch player by id, and fetch player resources with derived player progression fields on full player reads.
- Regression: invalid UUIDs, invalid names, duplicate display names, energy cap behavior, threshold edge cases, and no early promotion before the next respect floor.
