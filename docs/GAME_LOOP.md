# Game Loop

## Core loop

1. Player authenticates and loads current state.
2. Player lazily regenerates energy on request reads, then spends time, stamina, cash, items, or opportunity on actions.
3. Backend resolves risk, rewards, reputation, and side effects.
4. Realtime systems push outcomes such as chat, retaliation, gang updates, and live events.
5. Timers, cooldowns, payouts, and passive systems advance through workers.
6. Player returns to optimize the next move.

## Main progression loops

- `crime -> money/heat/xp -> equipment/businesses -> stronger crime options`
- `crime -> failure consequence -> jail/hospital downtime -> delayed next action`
- `crime -> cash -> starter shop purchases -> owned inventory`
- `owned inventory -> equipped weapon/armor -> future combat readiness`
- `combat -> target damage -> hospital downtime -> revenge or recovery pressure`
- `combat -> hospital/jail/reputation -> revenge or deterrence`
- `gangs -> territory control -> district wars -> later conflict and reward systems`
- `missions -> directed goals -> cash/respect rewards -> clearer early progression`
- `live-events -> seasonal rewards -> leaderboard prestige`

## Failure loops

- Arrest leads to jail restrictions and lost opportunity.
- Defeat leads to hospital downtime and resource pressure.
- Poor liquidity limits action access and equipment upgrades.

## Design note

The game should reward planning and social strategy more than raw click speed.
