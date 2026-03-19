# Game Rules

## Rule ownership

- Every authoritative formula lives in backend-owned domain code or shared configuration.
- Balance values belong in central catalogs, never in React components.
- Cross-module effects must be documented in the owning module and referenced in `docs/DEPENDENCY_MAP.md`.

## Baseline economic rules

- Currency creation must have a named faucet.
- Currency destruction must have a named sink.
- Timed income must be worker-driven and idempotent.
- Player-to-player transfer surfaces must include fraud, abuse, and exploit review.

## Baseline action rules

- Actions declare costs, cooldowns, success logic, and side effects.
- Arrest, injury, and death-state behavior must be explicit and test-covered.
- Realtime notifications are advisory; the API remains the source of truth.

## Rule change policy

- Any balance change that affects more than one module must update docs and tests in the owning module.
- Hidden one-off modifiers are not allowed.

## Player foundation rules

- Initial player resource values must be explicit and owned by the player module until a dedicated stats/economy split exists.
- Player creation inputs must not accept client-supplied authoritative resource values.
- Cash persistence remains player-owned in this phase even when other modules cause debits.
- Energy regeneration is lazy and request-driven in this phase, using a player-owned sync timestamp instead of workers or cron jobs.

## Crime foundation rules

- Crime definitions must live in a centralized backend-owned catalog.
- Crime attempts consume energy whether they succeed or fail, after first synchronizing lazy energy regeneration.
- Success may award cash and respect.
- Failure may explicitly resolve to `none`, `jail`, or `hospital` based on the crime catalog.
- Crime execution is blocked while an active jail or hospital timer exists.

## Temporary custody and recovery model

- Jail and hospital state currently live on nullable player-adjacent release timestamps as the smallest correct persistence step.
- `jail` and `hospital` modules own active-state and release-timer rules even though player owns the stored fields.
- Expired jail or hospital timestamps stop blocking automatically based on current time.
- Bail, healing items, jailbreak, rescue flows, combat integration, and status history remain out of scope for this phase.
- Hospital recovery does not restore energy in this phase.

## Starter inventory and shop model

- Starter item definitions live in a centralized backend-owned catalog inside `inventory`.
- Player-owned items are persisted separately from `Player` in an inventory ownership table.
- Shop purchases must atomically debit player cash and create item ownership.
- Combat bonuses, item usage, trading, black market flows, consumables, rarity, and crafting remain out of scope for this phase.

## Starter equipment model

- Equipped state currently lives on owned inventory rows as a nullable equipped-slot reference.
- Valid slots are explicit and currently limited to `weapon` and `armor`.
- Slot compatibility is validated from the item catalog, not inferred in controllers or clients.
- Equipping replaces any existing item already in that slot for the same player.
- Combat effects, durability, ammo, loadouts, and PvP logic remain out of scope for this phase.

## Combat foundation rules

- Combat resolution is backend-owned and deterministic in this phase.
- Attackers cannot initiate combat while jailed or hospitalized.
- Targets may be attacked while jailed, but attacks against already hospitalized targets are rejected.
- Damage is currently `base attack + weapon bonus - armor reduction`, clamped to a minimum floor.
- Health is reduced but never below zero.
- If target health after damage is at or below the combat hospital threshold, hospital downtime is applied.
- Loot, cash stealing, combat history, death systems, crit chains, status effects, and ranking remain out of scope for this phase.

## Gangs foundation rules

- Gang membership is persisted in a dedicated `GangMember` table, not on `Player`.
- A player may belong to only one gang at a time, enforced by a unique gang-membership row per player.
- Gang creation assigns the creator as the `leader` in the same transaction that creates the gang.
- Gang roles are currently limited to `leader` and `member`.
- Members may leave gangs freely.
- Leaders may leave only when they are the sole remaining member; that leave deletes the empty gang.
- Gang invites are persisted in a dedicated gang-owned table with explicit `pending`, `accepted`, and `declined` states.
- Only gang leaders may send invites in this phase.
- A player may have only one pending gang invite at a time.
- Accepting an invite creates membership and marks the invite accepted in one backend-owned flow.
- Declining an invite keeps the invite record but marks it inactive.
- Gang wars, territory permissions, combat bonuses, shared inventory, economy systems, officer roles, notifications, and chat remain out of scope for this phase.

## Territory foundation rules

- Districts are persisted in a territory-owned table and represent stable world locations.
- Current district ownership is persisted as a single territory-owned control record per district.
- Territory may reference `gangId`, but gang existence remains validated through the gangs module.
- District claims require a real player actor in this phase.
- Only the leader of the claiming gang may claim a district.
- Unclaimed districts may still be claimed directly by an authorized leader.
- Claimed districts may no longer be directly replaced; they require a district war record.
- Only one active district war may exist per district at a time.
- District wars are minimal records with `pending` and `resolved` status in this phase.
- District war resolution is manual in this phase and sets district control to the winning gang.
- Territory bonuses, economy multipliers, war timers, battle rounds, player rosters, officer claim permissions, map UI, and rich war history remain out of scope for this phase.
