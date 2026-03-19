# Territory Rules

- Territory owns district records and the single current control record per district.
- Territory owns district payout amounts, payout cooldown configuration, and payout claim timestamps.
- Territory owns minimal district war records for contested districts.
- Territory may store `gangId` references but must not own gang identity or membership logic.
- Claiming a district requires a real player actor and directly changes current ownership only when the district is unclaimed.
- Only gang leaders may claim districts in this phase.
- Only the current leader of the controlling gang may claim a district payout in this phase.
- District payouts are blocked when the district is uncontrolled.
- District payouts are blocked until the district cooldown elapses from `lastPayoutClaimedAt`.
- Successful district payouts currently pay cash directly to the acting leader as a temporary placeholder until gang-bank systems exist.
- Claimed districts require a district war instead of direct replacement.
- Only one active district war may exist per district.
- District war resolution is manual in this phase and applies the winner to district control.
- Districts may be unclaimed.
- Battle simulation, passive payouts, gang banks, taxation, upgrades, multipliers, officer roles, combat integration, NPC control, and map UI are intentionally out of scope.
