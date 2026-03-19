# Stats Rules

- Health, stamina, heat, and XP must be mutated through explicit policies, not arbitrary field writes.
- Derived stats must document whether they are snapshotted or recomputed.
- Recovery rules must be idempotent for worker-driven recalculation.
