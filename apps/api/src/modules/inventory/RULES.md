# Inventory Rules

- Item ownership must be authoritative and transaction-safe.
- Starter item definitions must live in one centralized backend-owned catalog.
- Shop purchases must atomically debit player cash and create inventory ownership.
- Equipped state must reference owned inventory rows, not raw catalog ids.
- Market listing locks must reference owned inventory rows, not raw catalog ids.
- Equip slot compatibility must be explicit from the item catalog.
- Valid slots are currently limited to `weapon` and `armor`.
- Equipping an item clears any previously equipped item in the same slot for that player.
- Items locked by an active market listing cannot be equipped.
- Combat bonuses are defined in inventory-owned item definitions and consumed by combat through explicit projections.
- Item use, combat modifiers, consumables, durability, ammo, and loadouts are out of scope for this phase.
