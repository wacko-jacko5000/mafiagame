import type { CustodyBuyoutQuote } from "../../custody/domain/custody.types";
import { toPlayerResponseBody } from "../../player/api/player.presenter";
import type { HospitalStatus } from "../domain/hospital.types";
import type {
  HospitalBuyoutResponseBody,
  HospitalBuyoutStatusResponseBody,
  HospitalStatusResponseBody
} from "./hospital.contracts";

export function toHospitalStatusResponseBody(
  status: HospitalStatus
): HospitalStatusResponseBody {
  return {
    playerId: status.playerId,
    active: status.active,
    until: status.until?.toISOString() ?? null,
    remainingSeconds: status.remainingSeconds
  };
}

export function toHospitalBuyoutStatusResponseBody(
  quote: CustodyBuyoutQuote
): HospitalBuyoutStatusResponseBody {
  return {
    statusType: "hospital",
    active: quote.active,
    until: quote.until?.toISOString() ?? null,
    remainingSeconds: quote.remainingSeconds,
    reason: quote.reason,
    entryCountSinceLevelReset: quote.entryCountSinceLevelReset,
    repeatCountSinceLevelReset: quote.repeatCountSinceLevelReset,
    basePricePerMinute: quote.basePricePerMinute,
    currentPricePerMinute: quote.currentPricePerMinute,
    escalationEnabled: quote.escalationEnabled,
    escalationPercentage: quote.escalationPercentage,
    minimumPrice: quote.minimumPrice,
    roundingRule: quote.roundingRule,
    buyoutPrice: quote.buyoutPrice
  };
}

export function toHospitalBuyoutResponseBody(input: {
  buyoutPrice: number;
  player: Parameters<typeof toPlayerResponseBody>[0];
}): HospitalBuyoutResponseBody {
  return {
    buyoutPrice: input.buyoutPrice,
    player: toPlayerResponseBody(input.player)
  };
}
