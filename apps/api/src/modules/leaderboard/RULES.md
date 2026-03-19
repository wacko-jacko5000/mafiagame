# Leaderboard Rules

- This phase is read-only and must derive rankings from existing persisted state.
- Leaderboard definitions are static and module-owned in this phase.
- Tie-breakers are explicit: metric descending, then `Player.createdAt` ascending, then `Player.id` ascending.
- Do not add seasons, snapshots, rewards, anti-cheat, or heavy precomputation in this phase.
- Do not infer a `strongest_players` board until a clear authoritative persisted strength metric exists.
