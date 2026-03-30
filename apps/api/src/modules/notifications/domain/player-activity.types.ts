export type PlayerActivityType =
  | "market_item_sold"
  | "territory_payout_claimed"
  | "territory_war_won"
  | "achievement_unlocked"
  | "gang_invite_received"
  | "jail.entered"
  | "jail.buyout"
  | "hospital.entered"
  | "hospital.buyout"
  | "combat_attack_won";

export interface PlayerActivitySnapshot {
  id: string;
  playerId: string;
  type: PlayerActivityType;
  title: string;
  body: string;
  createdAt: Date;
  readAt: Date | null;
}

export interface CreatePlayerActivity {
  playerId: string;
  type: PlayerActivityType;
  title: string;
  body: string;
  createdAt: Date;
}
