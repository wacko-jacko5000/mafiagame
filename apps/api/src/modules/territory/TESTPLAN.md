# Territory Test Plan

- Application: district listing, district detail reads, unclaimed claim flows, payout claim flows, war start flows, war resolution, and leader-only authorization.
- API: list districts, read district by id, claim unclaimed district, claim district payout, start district war, read active war, read war by id, and resolve war.
- Edge: unknown district ids, unauthorized claims, uncontrolled payout attempts, wrong-gang payout attempts, payout cooldown enforcement, trying to directly claim controlled districts, duplicate active wars, invalid winners, and defender-win resolution.
