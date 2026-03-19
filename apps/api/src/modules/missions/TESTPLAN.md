# Missions Test Plan

- Unit: accept rules for repeatable and one-off missions.
- Unit: progress increments only apply to matching active missions.
- Unit: completion rejects incomplete or already-completed missions.
- Integration: gameplay services publish supported domain events after successful actions.
- Integration: missions subscribes to relevant gameplay events and records progress.
- Integration: mission completion grants cash/respect through player-owned state.
- Edge: repeated completion attempts and re-accepting completed one-off missions.
