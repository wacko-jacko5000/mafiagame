export type SeasonStatus = "draft" | "active" | "inactive";

export interface SeasonSnapshot {
  id: string;
  name: string;
  status: SeasonStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  activatedAt: Date | null;
  deactivatedAt: Date | null;
  createdAt: Date;
}

export interface CreateSeasonInput {
  name: string;
  startsAt: Date | null;
  endsAt: Date | null;
}
