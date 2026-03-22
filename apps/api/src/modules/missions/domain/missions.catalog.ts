import type { MissionDefinition, MissionObjectiveType } from "./missions.types";

interface MissionCatalogRow {
  id: string;
  name: string;
  unlockLevel: number;
  objectiveType: MissionObjectiveType;
  target: number;
  rewardCash: number;
  rewardRespect: number;
  itemType?: "weapon" | "armor";
}

function mission(
  row: MissionCatalogRow
): MissionDefinition {
  return {
    ...row,
    description: row.name,
    isRepeatable: false
  };
}

export const starterMissionCatalog = [
  mission({ id: "level-1-complete-5-crimes", name: "Complete 5 crimes", unlockLevel: 1, objectiveType: "crime_count", target: 5, rewardCash: 500, rewardRespect: 10 }),
  mission({ id: "level-1-earn-1000", name: "Earn $1,000", unlockLevel: 1, objectiveType: "earn_money", target: 1000, rewardCash: 600, rewardRespect: 0 }),
  mission({ id: "level-1-reach-10-respect", name: "Reach 10 respect", unlockLevel: 1, objectiveType: "reach_respect", target: 10, rewardCash: 800, rewardRespect: 0 }),
  mission({ id: "level-2-complete-8-crimes", name: "Complete 8 crimes", unlockLevel: 2, objectiveType: "crime_count", target: 8, rewardCash: 800, rewardRespect: 15 }),
  mission({ id: "level-2-earn-2500", name: "Earn $2,500", unlockLevel: 2, objectiveType: "earn_money", target: 2500, rewardCash: 1200, rewardRespect: 0 }),
  mission({ id: "level-2-reach-25-respect", name: "Reach 25 respect", unlockLevel: 2, objectiveType: "reach_respect", target: 25, rewardCash: 1500, rewardRespect: 0 }),
  mission({ id: "level-3-complete-10-crimes", name: "Complete 10 crimes", unlockLevel: 3, objectiveType: "crime_count", target: 10, rewardCash: 1200, rewardRespect: 20 }),
  mission({ id: "level-3-earn-5000", name: "Earn $5,000", unlockLevel: 3, objectiveType: "earn_money", target: 5000, rewardCash: 2000, rewardRespect: 0 }),
  mission({ id: "level-3-buy-first-weapon", name: "Buy your first weapon", unlockLevel: 3, objectiveType: "buy_items", target: 1, rewardCash: 2500, rewardRespect: 0, itemType: "weapon" }),
  mission({ id: "level-4-complete-12-crimes", name: "Complete 12 crimes", unlockLevel: 4, objectiveType: "crime_count", target: 12, rewardCash: 1800, rewardRespect: 25 }),
  mission({ id: "level-4-earn-8000", name: "Earn $8,000", unlockLevel: 4, objectiveType: "earn_money", target: 8000, rewardCash: 3000, rewardRespect: 0 }),
  mission({ id: "level-4-reach-60-respect", name: "Reach 60 respect", unlockLevel: 4, objectiveType: "reach_respect", target: 60, rewardCash: 3500, rewardRespect: 0 }),
  mission({ id: "level-5-complete-15-crimes", name: "Complete 15 crimes", unlockLevel: 5, objectiveType: "crime_count", target: 15, rewardCash: 2500, rewardRespect: 30 }),
  mission({ id: "level-5-earn-12000", name: "Earn $12,000", unlockLevel: 5, objectiveType: "earn_money", target: 12000, rewardCash: 4000, rewardRespect: 0 }),
  mission({ id: "level-5-equip-weapon", name: "Equip a weapon", unlockLevel: 5, objectiveType: "equip_weapon", target: 1, rewardCash: 4500, rewardRespect: 0 }),
  mission({ id: "level-6-complete-18-crimes", name: "Complete 18 crimes", unlockLevel: 6, objectiveType: "crime_count", target: 18, rewardCash: 4000, rewardRespect: 40 }),
  mission({ id: "level-6-earn-20000", name: "Earn $20,000", unlockLevel: 6, objectiveType: "earn_money", target: 20000, rewardCash: 6000, rewardRespect: 0 }),
  mission({ id: "level-6-buy-2-items", name: "Buy 2 items", unlockLevel: 6, objectiveType: "buy_items", target: 2, rewardCash: 7000, rewardRespect: 0 }),
  mission({ id: "level-7-complete-20-crimes", name: "Complete 20 crimes", unlockLevel: 7, objectiveType: "crime_count", target: 20, rewardCash: 6000, rewardRespect: 50 }),
  mission({ id: "level-7-earn-30000", name: "Earn $30,000", unlockLevel: 7, objectiveType: "earn_money", target: 30000, rewardCash: 8000, rewardRespect: 0 }),
  mission({ id: "level-7-equip-armor", name: "Equip armor", unlockLevel: 7, objectiveType: "equip_armor", target: 1, rewardCash: 9000, rewardRespect: 0 }),
  mission({ id: "level-8-complete-25-crimes", name: "Complete 25 crimes", unlockLevel: 8, objectiveType: "crime_count", target: 25, rewardCash: 8000, rewardRespect: 60 }),
  mission({ id: "level-8-earn-50000", name: "Earn $50,000", unlockLevel: 8, objectiveType: "earn_money", target: 50000, rewardCash: 12000, rewardRespect: 0 }),
  mission({ id: "level-8-win-2-combats", name: "Win 2 combats", unlockLevel: 8, objectiveType: "win_combat", target: 2, rewardCash: 14000, rewardRespect: 0 }),
  mission({ id: "level-9-complete-30-crimes", name: "Complete 30 crimes", unlockLevel: 9, objectiveType: "crime_count", target: 30, rewardCash: 12000, rewardRespect: 70 }),
  mission({ id: "level-9-earn-75000", name: "Earn $75,000", unlockLevel: 9, objectiveType: "earn_money", target: 75000, rewardCash: 15000, rewardRespect: 0 }),
  mission({ id: "level-9-own-3-items", name: "Own 3 items", unlockLevel: 9, objectiveType: "own_items", target: 3, rewardCash: 18000, rewardRespect: 0 }),
  mission({ id: "level-10-complete-35-crimes", name: "Complete 35 crimes", unlockLevel: 10, objectiveType: "crime_count", target: 35, rewardCash: 15000, rewardRespect: 80 }),
  mission({ id: "level-10-earn-100000", name: "Earn $100,000", unlockLevel: 10, objectiveType: "earn_money", target: 100000, rewardCash: 20000, rewardRespect: 0 }),
  mission({ id: "level-10-win-3-combats", name: "Win 3 combats", unlockLevel: 10, objectiveType: "win_combat", target: 3, rewardCash: 22000, rewardRespect: 0 }),
  mission({ id: "level-11-complete-40-crimes", name: "Complete 40 crimes", unlockLevel: 11, objectiveType: "crime_count", target: 40, rewardCash: 20000, rewardRespect: 90 }),
  mission({ id: "level-11-earn-150000", name: "Earn $150,000", unlockLevel: 11, objectiveType: "earn_money", target: 150000, rewardCash: 25000, rewardRespect: 0 }),
  mission({ id: "level-11-equip-full-loadout", name: "Equip full loadout (weapon + armor)", unlockLevel: 11, objectiveType: "equip_loadout", target: 1, rewardCash: 28000, rewardRespect: 0 }),
  mission({ id: "level-12-complete-45-crimes", name: "Complete 45 crimes", unlockLevel: 12, objectiveType: "crime_count", target: 45, rewardCash: 25000, rewardRespect: 100 }),
  mission({ id: "level-12-earn-200000", name: "Earn $200,000", unlockLevel: 12, objectiveType: "earn_money", target: 200000, rewardCash: 30000, rewardRespect: 0 }),
  mission({ id: "level-12-win-5-combats", name: "Win 5 combats", unlockLevel: 12, objectiveType: "win_combat", target: 5, rewardCash: 35000, rewardRespect: 0 }),
  mission({ id: "level-13-complete-50-crimes", name: "Complete 50 crimes", unlockLevel: 13, objectiveType: "crime_count", target: 50, rewardCash: 30000, rewardRespect: 110 }),
  mission({ id: "level-13-earn-300000", name: "Earn $300,000", unlockLevel: 13, objectiveType: "earn_money", target: 300000, rewardCash: 40000, rewardRespect: 0 }),
  mission({ id: "level-13-defeat-3-players", name: "Defeat 3 players", unlockLevel: 13, objectiveType: "win_combat", target: 3, rewardCash: 45000, rewardRespect: 0 }),
  mission({ id: "level-14-complete-55-crimes", name: "Complete 55 crimes", unlockLevel: 14, objectiveType: "crime_count", target: 55, rewardCash: 40000, rewardRespect: 120 }),
  mission({ id: "level-14-earn-400000", name: "Earn $400,000", unlockLevel: 14, objectiveType: "earn_money", target: 400000, rewardCash: 50000, rewardRespect: 0 }),
  mission({ id: "level-14-join-gang", name: "Join a gang", unlockLevel: 14, objectiveType: "join_gang", target: 1, rewardCash: 55000, rewardRespect: 0 }),
  mission({ id: "level-15-complete-60-crimes", name: "Complete 60 crimes", unlockLevel: 15, objectiveType: "crime_count", target: 60, rewardCash: 50000, rewardRespect: 130 }),
  mission({ id: "level-15-earn-500000", name: "Earn $500,000", unlockLevel: 15, objectiveType: "earn_money", target: 500000, rewardCash: 60000, rewardRespect: 0 }),
  mission({ id: "level-15-recruit-1-member", name: "Recruit 1 gang member", unlockLevel: 15, objectiveType: "recruit_member", target: 1, rewardCash: 65000, rewardRespect: 0 }),
  mission({ id: "level-16-complete-70-crimes", name: "Complete 70 crimes", unlockLevel: 16, objectiveType: "crime_count", target: 70, rewardCash: 70000, rewardRespect: 150 }),
  mission({ id: "level-16-earn-700000", name: "Earn $700,000", unlockLevel: 16, objectiveType: "earn_money", target: 700000, rewardCash: 80000, rewardRespect: 0 }),
  mission({ id: "level-16-win-7-combats", name: "Win 7 combats", unlockLevel: 16, objectiveType: "win_combat", target: 7, rewardCash: 90000, rewardRespect: 0 }),
  mission({ id: "level-17-complete-80-crimes", name: "Complete 80 crimes", unlockLevel: 17, objectiveType: "crime_count", target: 80, rewardCash: 90000, rewardRespect: 170 }),
  mission({ id: "level-17-earn-1000000", name: "Earn $1,000,000", unlockLevel: 17, objectiveType: "earn_money", target: 1000000, rewardCash: 100000, rewardRespect: 0 }),
  mission({ id: "level-17-control-1-district", name: "Control 1 district", unlockLevel: 17, objectiveType: "control_districts", target: 1, rewardCash: 120000, rewardRespect: 0 }),
  mission({ id: "level-18-complete-90-crimes", name: "Complete 90 crimes", unlockLevel: 18, objectiveType: "crime_count", target: 90, rewardCash: 120000, rewardRespect: 190 }),
  mission({ id: "level-18-earn-1500000", name: "Earn $1,500,000", unlockLevel: 18, objectiveType: "earn_money", target: 1500000, rewardCash: 140000, rewardRespect: 0 }),
  mission({ id: "level-18-win-10-combats", name: "Win 10 combats", unlockLevel: 18, objectiveType: "win_combat", target: 10, rewardCash: 160000, rewardRespect: 0 }),
  mission({ id: "level-19-complete-100-crimes", name: "Complete 100 crimes", unlockLevel: 19, objectiveType: "crime_count", target: 100, rewardCash: 150000, rewardRespect: 210 }),
  mission({ id: "level-19-earn-2000000", name: "Earn $2,000,000", unlockLevel: 19, objectiveType: "earn_money", target: 2000000, rewardCash: 180000, rewardRespect: 0 }),
  mission({ id: "level-19-control-2-districts", name: "Control 2 districts", unlockLevel: 19, objectiveType: "control_districts", target: 2, rewardCash: 200000, rewardRespect: 0 }),
  mission({ id: "level-20-complete-120-crimes", name: "Complete 120 crimes", unlockLevel: 20, objectiveType: "crime_count", target: 120, rewardCash: 200000, rewardRespect: 240 }),
  mission({ id: "level-20-earn-3000000", name: "Earn $3,000,000", unlockLevel: 20, objectiveType: "earn_money", target: 3000000, rewardCash: 250000, rewardRespect: 0 }),
  mission({ id: "level-20-win-15-combats", name: "Win 15 combats", unlockLevel: 20, objectiveType: "win_combat", target: 15, rewardCash: 300000, rewardRespect: 0 }),
  mission({ id: "level-21-complete-150-crimes", name: "Complete 150 crimes", unlockLevel: 21, objectiveType: "crime_count", target: 150, rewardCash: 300000, rewardRespect: 300 }),
  mission({ id: "level-21-earn-5000000", name: "Earn $5,000,000", unlockLevel: 21, objectiveType: "earn_money", target: 5000000, rewardCash: 400000, rewardRespect: 0 }),
  mission({ id: "level-21-control-3-districts", name: "Control 3 districts", unlockLevel: 21, objectiveType: "control_districts", target: 3, rewardCash: 500000, rewardRespect: 0 })
] as const satisfies readonly MissionDefinition[];

export function getMissionById(missionId: string): MissionDefinition | undefined {
  return starterMissionCatalog.find((mission) => mission.id === missionId);
}
