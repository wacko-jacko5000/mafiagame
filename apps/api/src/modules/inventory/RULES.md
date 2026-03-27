# Inventory Rules

- Item ownership must be authoritative and transaction-safe.
- Starter item definitions must live in one centralized backend-owned catalog.
- Weapon and armor unlock level are static inventory-owned catalog data in this phase.
- Shop availability is derived at read time from player-owned level/rank progression; unlock state is not persisted.
- Equipment purchases must atomically debit player cash and create inventory ownership.
- Instant consumable purchases must debit player cash and apply their effects server-side from backend-owned definitions.
- Shop purchases must reject items whose required unlock level is above the player's current derived level.
- Equip commands must also reject owned items whose required unlock level is above the player's current derived level.
- Equipped state must reference owned inventory rows, not raw catalog ids.
- Market listing locks must reference owned inventory rows, not raw catalog ids.
- Equip slot compatibility must be explicit from the item catalog.
- Valid slots are currently limited to `weapon` and `armor`.
- Equipping an item clears any previously equipped item in the same slot for that player.
- Items locked by an active market listing cannot be equipped.
- Combat weapon and armor bonuses are defined in inventory-owned item definitions and consumed by combat through explicit projections.
- Inventory-backed consumable ownership, richer combat modifiers, durability, ammo, and broader loadouts are out of scope for this phase.
