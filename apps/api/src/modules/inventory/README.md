# Inventory Module

## Purpose

Own item catalogs, player-held items, equipment slots, and consumable use.

## Responsibilities

- Track acquisition and removal of items.
- Expose a centralized starter item catalog and player inventory reads.
- Persist editable starter shop prices while keeping item ids, names, slots, and combat metadata in the module catalog.
- Orchestrate starter shop purchases while leaving cash persistence on `player`.
- Own equipped-state reads and equip/unequip rules for owned items.
- Expose internal equipped loadout projections for combat resolution.
- Expose stable item contracts to future combat, crime, market, and missions work.

## Entities and value objects

- `InventoryItem`
- `ItemDefinition`
- `EquipmentSlot`

## Dependencies

- `player`

## Temporary note

- This phase uses a small module-owned starter item catalog in the inventory module, with persisted price overrides hydrated at startup.
- Owned items are stored one row per purchase in `player_inventory_items`.
- Equipped state currently lives as a nullable slot on owned inventory rows.
- A listed item is temporarily locked by a nullable market-listing reference on the owned inventory row.
- Item use, consumables, rarity, crafting, durability, ammo, and loadouts are intentionally left out for later.

## Events

- Out: `inventory.item_purchased`, `inventory.item.added`, `inventory.item.used`
- In: `market.item_sold`

## API surface

- Shop item reads
- Player inventory reads
- Starter item purchase command
- Equipped item reads
- Equip and unequip commands

## Test expectations

- Ownership rules
- Atomic purchase behavior
- Insufficient cash handling
- Equipment slot validation
- Equip and unequip behavior
- Listed-item equip rejection
