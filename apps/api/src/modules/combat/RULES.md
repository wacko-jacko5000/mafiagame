# Combat Rules

- Combat resolution must be atomic from the backend perspective.
- Equipment modifiers must come from inventory-owned item definitions, not UI assumptions.
- Defeat consequences such as jail or hospital routing must be explicit result outputs.
- This phase uses a deterministic formula: `12 + weapon bonus - armor reduction`, with a minimum damage floor of `2`.
- Attackers cannot attack while jailed or hospitalized.
- Targets may still be attacked while jailed, but hospitalized targets are not valid combat targets.
- Targets are hospitalized when post-damage health is at or below `10`.
- Loot, cash stealing, death, combat history, crits, status effects, ammo, and durability are out of scope.
