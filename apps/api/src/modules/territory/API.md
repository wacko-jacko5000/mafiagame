# Territory API

- `GET /districts`
  - response: list of `{ id, name, payout, createdAt, controller, activeWar }`
- `GET /districts/:districtId`
  - response: `{ id, name, payout, createdAt, controller, activeWar }`
- `POST /districts/:districtId/claim`
  - request: `{ "playerId": string, "gangId": string }`
  - response: `{ id, name, payout, createdAt, controller, activeWar }`
- `POST /districts/:districtId/payout/claim`
  - request: `{ "playerId": string, "gangId": string }`
  - response: `{ district, payoutAmount, claimedAt, paidToPlayerId, playerCashAfterClaim }`
- `POST /districts/:districtId/war/start`
  - request: `{ "playerId": string, "attackerGangId": string }`
  - response: district war record
- `GET /districts/:districtId/war`
  - response: active district war or `null`
- `GET /district-wars/:warId`
  - response: district war record
- `POST /district-wars/:warId/resolve`
  - request: `{ "winningGangId": string }`
  - response: `{ war, district }`
- Internal event contracts: `territory.district_claimed`, `territory.payout_claimed`, `territory.war_won`

## Payout fields

- `payout.amount`: static base payout configured on the district.
- `payout.cooldownMinutes`: static cooldown configured on the district.
- `payout.lastClaimedAt`: nullable timestamp stored on the current control record.
- `payout.nextClaimAvailableAt`: derived read field for client visibility.

## Temporary rule

- Successful payout claims currently credit the acting leader's player cash directly.
- This is a deliberate placeholder until gang-bank ownership and passive payout systems are implemented.
- Admin balance reads and updates for `payout.amount` and `payout.cooldownMinutes` now flow through `admin-tools`, but the values remain territory-owned.
