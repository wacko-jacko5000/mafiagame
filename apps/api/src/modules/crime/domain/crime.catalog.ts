import type {
  CrimeDefinition,
  CrimeDifficulty,
  CrimeFailureConsequence
} from "./crime.types";

export interface CrimeCatalogRow {
  id: string;
  name: string;
  unlockLevel: number;
  difficulty: CrimeDifficulty;
  minReward: number;
  maxReward: number;
  respectReward: number;
}

export function buildCrimeDefinition(row: CrimeCatalogRow): CrimeDefinition {
  const defaultsByDifficulty: Record<
    CrimeDifficulty,
    Pick<CrimeDefinition, "energyCost" | "successRate" | "failureConsequence">
  > = {
    easy: {
      energyCost: 10,
      successRate: 0.78,
      failureConsequence: { type: "none" }
    },
    medium: {
      energyCost: 14,
      successRate: 0.64,
      failureConsequence: { type: "jail", durationSeconds: 300 }
    },
    hard: {
      energyCost: 18,
      successRate: 0.52,
      failureConsequence: { type: "jail", durationSeconds: 600 }
    },
    very_hard: {
      energyCost: 22,
      successRate: 0.4,
      failureConsequence: { type: "hospital", durationSeconds: 900 }
    }
  };

  const defaults = defaultsByDifficulty[row.difficulty];

  return {
    ...row,
    energyCost: defaults.energyCost,
    successRate: defaults.successRate,
    failureConsequence: cloneFailureConsequence(defaults.failureConsequence)
  };
}

function cloneFailureConsequence(
  failureConsequence: CrimeFailureConsequence
): CrimeFailureConsequence {
  return failureConsequence.type === "none"
    ? { type: "none" }
    : {
        type: failureConsequence.type,
        durationSeconds: failureConsequence.durationSeconds
      };
}

const defaultStarterCrimeCatalog: readonly CrimeCatalogRow[] = [
  { id: "pickpocket", name: "Pickpocket", unlockLevel: 1, difficulty: "easy", minReward: 50, maxReward: 120, respectReward: 1 },
  { id: "shoplift-candy", name: "Shoplift Candy", unlockLevel: 1, difficulty: "medium", minReward: 80, maxReward: 150, respectReward: 2 },
  { id: "steal-wallet", name: "Steal Wallet", unlockLevel: 1, difficulty: "hard", minReward: 100, maxReward: 180, respectReward: 2 },
  { id: "mug-civilian", name: "Mug Civilian", unlockLevel: 1, difficulty: "very_hard", minReward: 120, maxReward: 220, respectReward: 3 },
  { id: "steal-phone", name: "Steal Phone", unlockLevel: 2, difficulty: "easy", minReward: 120, maxReward: 220, respectReward: 3 },
  { id: "break-into-car", name: "Break Into Car", unlockLevel: 2, difficulty: "medium", minReward: 150, maxReward: 300, respectReward: 4 },
  { id: "snatch-purse", name: "Snatch Purse", unlockLevel: 2, difficulty: "hard", minReward: 180, maxReward: 320, respectReward: 4 },
  { id: "street-robbery", name: "Street Robbery", unlockLevel: 2, difficulty: "very_hard", minReward: 200, maxReward: 400, respectReward: 5 },
  { id: "rob-tourist", name: "Rob Tourist", unlockLevel: 3, difficulty: "easy", minReward: 250, maxReward: 400, respectReward: 5 },
  { id: "sell-fake-goods", name: "Sell Fake Goods", unlockLevel: 3, difficulty: "medium", minReward: 200, maxReward: 350, respectReward: 5 },
  { id: "delivery-scam", name: "Delivery Scam", unlockLevel: 3, difficulty: "hard", minReward: 300, maxReward: 500, respectReward: 6 },
  { id: "smash-and-grab", name: "Smash & Grab", unlockLevel: 3, difficulty: "very_hard", minReward: 350, maxReward: 600, respectReward: 7 },
  { id: "burglarize-house", name: "Burglarize House", unlockLevel: 4, difficulty: "easy", minReward: 400, maxReward: 700, respectReward: 7 },
  { id: "street-scam", name: "Street Scam", unlockLevel: 4, difficulty: "medium", minReward: 350, maxReward: 600, respectReward: 6 },
  { id: "garage-theft", name: "Garage Theft", unlockLevel: 4, difficulty: "hard", minReward: 500, maxReward: 800, respectReward: 8 },
  { id: "black-market-flip", name: "Black Market Flip", unlockLevel: 4, difficulty: "very_hard", minReward: 600, maxReward: 1000, respectReward: 9 },
  { id: "drug-delivery", name: "Drug Delivery", unlockLevel: 5, difficulty: "easy", minReward: 600, maxReward: 1100, respectReward: 9 },
  { id: "store-robbery", name: "Store Robbery", unlockLevel: 5, difficulty: "medium", minReward: 700, maxReward: 1200, respectReward: 10 },
  { id: "protection-shake", name: "Protection Shake", unlockLevel: 5, difficulty: "hard", minReward: 800, maxReward: 1400, respectReward: 11 },
  { id: "armed-robbery", name: "Armed Robbery", unlockLevel: 5, difficulty: "very_hard", minReward: 900, maxReward: 1500, respectReward: 12 },
  { id: "warehouse-theft", name: "Warehouse Theft", unlockLevel: 6, difficulty: "easy", minReward: 1200, maxReward: 2000, respectReward: 12 },
  { id: "car-theft", name: "Car Theft", unlockLevel: 6, difficulty: "medium", minReward: 1000, maxReward: 1800, respectReward: 11 },
  { id: "cargo-hijack", name: "Cargo Hijack", unlockLevel: 6, difficulty: "hard", minReward: 1400, maxReward: 2400, respectReward: 13 },
  { id: "dealer-robbery", name: "Dealer Robbery", unlockLevel: 6, difficulty: "very_hard", minReward: 1600, maxReward: 2600, respectReward: 14 },
  { id: "atm-skim", name: "ATM Skim", unlockLevel: 7, difficulty: "easy", minReward: 1800, maxReward: 2800, respectReward: 14 },
  { id: "illegal-gambling-setup", name: "Illegal Gambling Setup", unlockLevel: 7, difficulty: "medium", minReward: 1500, maxReward: 2500, respectReward: 13 },
  { id: "safe-crack", name: "Safe Crack", unlockLevel: 7, difficulty: "hard", minReward: 2000, maxReward: 3200, respectReward: 15 },
  { id: "truck-robbery", name: "Truck Robbery", unlockLevel: 7, difficulty: "very_hard", minReward: 2200, maxReward: 3500, respectReward: 16 },
  { id: "jewelry-store-heist", name: "Jewelry Store Heist", unlockLevel: 8, difficulty: "easy", minReward: 2500, maxReward: 4000, respectReward: 18 },
  { id: "smuggling-run", name: "Smuggling Run", unlockLevel: 8, difficulty: "medium", minReward: 2200, maxReward: 3500, respectReward: 17 },
  { id: "casino-cheat", name: "Casino Cheat", unlockLevel: 8, difficulty: "hard", minReward: 2800, maxReward: 4500, respectReward: 19 },
  { id: "armored-delivery-hit", name: "Armored Delivery Hit", unlockLevel: 8, difficulty: "very_hard", minReward: 3000, maxReward: 5000, respectReward: 20 },
  { id: "bank-setup", name: "Bank Setup", unlockLevel: 9, difficulty: "easy", minReward: 3000, maxReward: 5000, respectReward: 20 },
  { id: "protection-racket", name: "Protection Racket", unlockLevel: 9, difficulty: "medium", minReward: 2800, maxReward: 4800, respectReward: 19 },
  { id: "luxury-theft", name: "Luxury Theft", unlockLevel: 9, difficulty: "hard", minReward: 3500, maxReward: 6000, respectReward: 22 },
  { id: "heist-planning", name: "Heist Planning", unlockLevel: 9, difficulty: "very_hard", minReward: 4000, maxReward: 7000, respectReward: 23 },
  { id: "bank-robbery", name: "Bank Robbery", unlockLevel: 10, difficulty: "easy", minReward: 5000, maxReward: 9000, respectReward: 25 },
  { id: "large-drug-deal", name: "Large Drug Deal", unlockLevel: 10, difficulty: "medium", minReward: 4500, maxReward: 8000, respectReward: 24 },
  { id: "casino-robbery", name: "Casino Robbery", unlockLevel: 10, difficulty: "hard", minReward: 6000, maxReward: 10000, respectReward: 27 },
  { id: "syndicate-theft", name: "Syndicate Theft", unlockLevel: 10, difficulty: "very_hard", minReward: 7000, maxReward: 12000, respectReward: 28 },
  { id: "armored-truck-robbery", name: "Armored Truck Robbery", unlockLevel: 11, difficulty: "easy", minReward: 9000, maxReward: 15000, respectReward: 30 },
  { id: "weapon-smuggling", name: "Weapon Smuggling", unlockLevel: 11, difficulty: "medium", minReward: 8000, maxReward: 14000, respectReward: 28 },
  { id: "military-supply-theft", name: "Military Supply Theft", unlockLevel: 11, difficulty: "hard", minReward: 10000, maxReward: 16000, respectReward: 32 },
  { id: "security-breach", name: "Security Breach", unlockLevel: 11, difficulty: "very_hard", minReward: 11000, maxReward: 18000, respectReward: 34 },
  { id: "corporate-fraud", name: "Corporate Fraud", unlockLevel: 12, difficulty: "easy", minReward: 12000, maxReward: 20000, respectReward: 35 },
  { id: "blackmail-ceo", name: "Blackmail CEO", unlockLevel: 12, difficulty: "medium", minReward: 11000, maxReward: 18000, respectReward: 33 },
  { id: "data-theft", name: "Data Theft", unlockLevel: 12, difficulty: "hard", minReward: 14000, maxReward: 22000, respectReward: 37 },
  { id: "insider-trading", name: "Insider Trading", unlockLevel: 12, difficulty: "very_hard", minReward: 15000, maxReward: 25000, respectReward: 38 },
  { id: "contract-hit", name: "Contract Hit", unlockLevel: 13, difficulty: "easy", minReward: 15000, maxReward: 25000, respectReward: 40 },
  { id: "silent-assassination", name: "Silent Assassination", unlockLevel: 13, difficulty: "medium", minReward: 18000, maxReward: 28000, respectReward: 42 },
  { id: "elite-hit-job", name: "Elite Hit Job", unlockLevel: 13, difficulty: "hard", minReward: 20000, maxReward: 32000, respectReward: 45 },
  { id: "target-elimination", name: "Target Elimination", unlockLevel: 13, difficulty: "very_hard", minReward: 22000, maxReward: 35000, respectReward: 47 },
  { id: "territory-extortion", name: "Territory Extortion", unlockLevel: 14, difficulty: "easy", minReward: 20000, maxReward: 35000, respectReward: 45 },
  { id: "gang-raid", name: "Gang Raid", unlockLevel: 14, difficulty: "medium", minReward: 22000, maxReward: 38000, respectReward: 48 },
  { id: "city-control-operation", name: "City Control Operation", unlockLevel: 14, difficulty: "hard", minReward: 25000, maxReward: 42000, respectReward: 50 },
  { id: "rival-takeover", name: "Rival Takeover", unlockLevel: 14, difficulty: "very_hard", minReward: 28000, maxReward: 45000, respectReward: 52 },
  { id: "major-heist", name: "Major Heist", unlockLevel: 15, difficulty: "easy", minReward: 30000, maxReward: 50000, respectReward: 55 },
  { id: "money-laundering", name: "Money Laundering", unlockLevel: 15, difficulty: "medium", minReward: 28000, maxReward: 48000, respectReward: 53 },
  { id: "black-network-operation", name: "Black Network Operation", unlockLevel: 15, difficulty: "hard", minReward: 35000, maxReward: 55000, respectReward: 58 },
  { id: "organized-crime-deal", name: "Organized Crime Deal", unlockLevel: 15, difficulty: "very_hard", minReward: 38000, maxReward: 60000, respectReward: 60 },
  { id: "international-smuggling", name: "International Smuggling", unlockLevel: 16, difficulty: "easy", minReward: 50000, maxReward: 80000, respectReward: 65 },
  { id: "syndicate-operation", name: "Syndicate Operation", unlockLevel: 16, difficulty: "medium", minReward: 45000, maxReward: 75000, respectReward: 62 },
  { id: "global-trade-theft", name: "Global Trade Theft", unlockLevel: 16, difficulty: "hard", minReward: 55000, maxReward: 90000, respectReward: 68 },
  { id: "cross-border-heist", name: "Cross-Border Heist", unlockLevel: 16, difficulty: "very_hard", minReward: 60000, maxReward: 95000, respectReward: 70 },
  { id: "political-corruption", name: "Political Corruption", unlockLevel: 17, difficulty: "easy", minReward: 80000, maxReward: 120000, respectReward: 75 },
  { id: "military-theft", name: "Military Theft", unlockLevel: 17, difficulty: "medium", minReward: 90000, maxReward: 140000, respectReward: 78 },
  { id: "intelligence-leak", name: "Intelligence Leak", unlockLevel: 17, difficulty: "hard", minReward: 100000, maxReward: 150000, respectReward: 80 },
  { id: "government-bribery", name: "Government Bribery", unlockLevel: 17, difficulty: "very_hard", minReward: 110000, maxReward: 160000, respectReward: 82 },
  { id: "global-trafficking", name: "Global Trafficking", unlockLevel: 18, difficulty: "easy", minReward: 120000, maxReward: 180000, respectReward: 90 },
  { id: "intelligence-breach", name: "Intelligence Breach", unlockLevel: 18, difficulty: "medium", minReward: 110000, maxReward: 170000, respectReward: 88 },
  { id: "strategic-manipulation", name: "Strategic Manipulation", unlockLevel: 18, difficulty: "hard", minReward: 140000, maxReward: 200000, respectReward: 92 },
  { id: "covert-operation", name: "Covert Operation", unlockLevel: 18, difficulty: "very_hard", minReward: 150000, maxReward: 220000, respectReward: 95 },
  { id: "national-bank-heist", name: "National Bank Heist", unlockLevel: 19, difficulty: "easy", minReward: 200000, maxReward: 300000, respectReward: 110 },
  { id: "government-blackmail", name: "Government Blackmail", unlockLevel: 19, difficulty: "medium", minReward: 220000, maxReward: 320000, respectReward: 115 },
  { id: "financial-collapse-scheme", name: "Financial Collapse Scheme", unlockLevel: 19, difficulty: "hard", minReward: 250000, maxReward: 350000, respectReward: 120 },
  { id: "empire-expansion", name: "Empire Expansion", unlockLevel: 19, difficulty: "very_hard", minReward: 280000, maxReward: 400000, respectReward: 125 },
  { id: "war-operation", name: "War Operation", unlockLevel: 20, difficulty: "easy", minReward: 350000, maxReward: 500000, respectReward: 140 },
  { id: "economic-takeover", name: "Economic Takeover", unlockLevel: 20, difficulty: "medium", minReward: 400000, maxReward: 600000, respectReward: 150 },
  { id: "power-consolidation", name: "Power Consolidation", unlockLevel: 20, difficulty: "hard", minReward: 450000, maxReward: 650000, respectReward: 155 },
  { id: "global-influence-deal", name: "Global Influence Deal", unlockLevel: 20, difficulty: "very_hard", minReward: 500000, maxReward: 700000, respectReward: 160 },
  { id: "global-syndicate-control", name: "Global Syndicate Control", unlockLevel: 21, difficulty: "easy", minReward: 700000, maxReward: 1000000, respectReward: 200 },
  { id: "shadow-empire-expansion", name: "Shadow Empire Expansion", unlockLevel: 21, difficulty: "medium", minReward: 800000, maxReward: 1200000, respectReward: 220 },
  { id: "world-market-manipulation", name: "World Market Manipulation", unlockLevel: 21, difficulty: "hard", minReward: 900000, maxReward: 1300000, respectReward: 230 },
  { id: "ultimate-power-play", name: "Ultimate Power Play", unlockLevel: 21, difficulty: "very_hard", minReward: 1000000, maxReward: 1500000, respectReward: 250 }
] as const satisfies readonly CrimeCatalogRow[];

export const starterCrimeCatalog: readonly CrimeDefinition[] =
  defaultStarterCrimeCatalog.map((crime) => buildCrimeDefinition(crime));

export function getCrimeById(crimeId: string): CrimeDefinition | undefined {
  return starterCrimeCatalog.find((crime) => crime.id === crimeId);
}

export function applyCrimeBalanceOverride(
  crimeId: string,
  values: Pick<
    CrimeDefinition,
    "energyCost" | "successRate" | "minReward" | "maxReward" | "respectReward"
  >
): CrimeDefinition | undefined {
  const crime = getCrimeById(crimeId);

  if (!crime) {
    return undefined;
  }

  crime.energyCost = values.energyCost;
  crime.successRate = values.successRate;
  crime.minReward = values.minReward;
  crime.maxReward = values.maxReward;
  crime.respectReward = values.respectReward;

  return crime;
}

export function resetStarterCrimeCatalog(): void {
  starterCrimeCatalog.forEach((crime, index) => {
    const defaultCrime = buildCrimeDefinition(defaultStarterCrimeCatalog[index]!);

    crime.id = defaultCrime.id;
    crime.name = defaultCrime.name;
    crime.unlockLevel = defaultCrime.unlockLevel;
    crime.difficulty = defaultCrime.difficulty;
    crime.energyCost = defaultCrime.energyCost;
    crime.successRate = defaultCrime.successRate;
    crime.minReward = defaultCrime.minReward;
    crime.maxReward = defaultCrime.maxReward;
    crime.respectReward = defaultCrime.respectReward;
    crime.failureConsequence = cloneFailureConsequence(defaultCrime.failureConsequence);
  });
}
