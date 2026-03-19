import type { MissionDefinition } from "./missions.types";

export const starterMissionCatalog = [
  {
    id: "crime-spree",
    name: "Crime Spree",
    description: "Commit 3 crimes to build early momentum.",
    objectiveType: "commit_crime_n_times",
    objectiveTarget: 3,
    rewardCash: 300,
    rewardRespect: 1,
    isRepeatable: true
  },
  {
    id: "supply-run",
    name: "Supply Run",
    description: "Buy 2 shop items to stock up for the streets.",
    objectiveType: "buy_item_n_times",
    objectiveTarget: 2,
    rewardCash: 250,
    rewardRespect: 1,
    isRepeatable: true
  },
  {
    id: "street-finisher",
    name: "Street Finisher",
    description: "Win 1 combat by putting your target in the hospital.",
    objectiveType: "win_combat_n_times",
    objectiveTarget: 1,
    rewardCash: 500,
    rewardRespect: 2,
    isRepeatable: true
  },
  {
    id: "first-claim",
    name: "First Claim",
    description: "Claim a district for your gang once.",
    objectiveType: "claim_district_once",
    objectiveTarget: 1,
    rewardCash: 1500,
    rewardRespect: 5,
    isRepeatable: false
  }
] as const satisfies readonly MissionDefinition[];

export function getMissionById(missionId: string): MissionDefinition | undefined {
  return starterMissionCatalog.find((mission) => mission.id === missionId);
}
