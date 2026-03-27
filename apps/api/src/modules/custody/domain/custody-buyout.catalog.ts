import { playerRankCatalog } from "../../player/domain/player-rank.catalog";
import type { CustodyBuyoutStatusConfig, CustodyStatusType } from "./custody.types";

const defaultBasePricePerMinuteByStatus: Record<CustodyStatusType, number> = {
  jail: 100,
  hospital: 125
};

const defaultStatusLabels: Record<CustodyStatusType, string> = {
  jail: "Jail",
  hospital: "Hospital"
};

export function buildDefaultCustodyBuyoutConfig(
  statusType: CustodyStatusType
): CustodyBuyoutStatusConfig {
  const baseRate = defaultBasePricePerMinuteByStatus[statusType];

  return {
    statusType,
    label: defaultStatusLabels[statusType],
    escalationEnabled: true,
    escalationPercentage: 0.1,
    minimumPrice: null,
    roundingRule: "ceil",
    levels: playerRankCatalog.map((rank) => ({
      level: rank.level,
      rank: rank.rank,
      basePricePerMinute: rank.level * baseRate
    }))
  };
}
