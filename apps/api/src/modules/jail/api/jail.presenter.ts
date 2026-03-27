import type { CustodyBuyoutQuote } from "../../custody/domain/custody.types";
import { toPlayerResponseBody } from "../../player/api/player.presenter";
import type { JailStatus } from "../domain/jail.types";
import type {
  JailBuyoutResponseBody,
  JailBuyoutStatusResponseBody,
  JailStatusResponseBody
} from "./jail.contracts";

export function toJailStatusResponseBody(
  status: JailStatus
): JailStatusResponseBody {
  return {
    playerId: status.playerId,
    active: status.active,
    until: status.until?.toISOString() ?? null,
    remainingSeconds: status.remainingSeconds
  };
}

export function toJailBuyoutStatusResponseBody(
  quote: CustodyBuyoutQuote
): JailBuyoutStatusResponseBody {
  return {
    statusType: "jail",
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

export function toJailBuyoutResponseBody(input: {
  buyoutPrice: number;
  player: Parameters<typeof toPlayerResponseBody>[0];
}): JailBuyoutResponseBody {
  return {
    buyoutPrice: input.buyoutPrice,
    player: toPlayerResponseBody(input.player)
  };
}
