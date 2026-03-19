# Player Rules

- The player module is the only owner of persistent player foundation state in this phase.
- Players are created explicitly through `POST /api/players`; there is no hidden auto-provisioning.
- `displayName` must be trimmed, length-bounded, and limited to letters, numbers, spaces, hyphens, and underscores.
- Initial resource values are explicit backend-owned defaults:
  - `cash = 2500`
  - `respect = 0`
  - `energy = 100`
  - `health = 100`
- Energy regeneration is player-owned and lazy in this phase:
  - `energyUpdatedAt` stores the last synchronized energy timestamp
  - energy regenerates at `+1` per elapsed minute
  - energy is capped at `100`
  - regeneration is applied on player reads and before energy mutations
- Resource values are not accepted from the client during creation.
- Player-owned custody fields are persistence only; jail and hospital timing rules must stay outside the player module.
