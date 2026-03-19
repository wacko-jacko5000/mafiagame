export interface PlayerSnapshot {
  id: string;
  accountId?: string | null;
  displayName: string;
  cash: number;
  respect: number;
  energy: number;
  energyUpdatedAt?: Date;
  health: number;
  jailedUntil: Date | null;
  hospitalizedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerResources {
  cash: number;
  respect: number;
  energy: number;
  health: number;
}

export interface PlayerResourceDelta {
  cash?: number;
  respect?: number;
  energy?: number;
  health?: number;
}

export interface PlayerCustodyStatusUpdate {
  jailedUntil?: Date | null;
  hospitalizedUntil?: Date | null;
}

export interface CreatePlayerCommand {
  displayName: string;
}

export interface PlayerCreationValues extends PlayerResources {
  accountId?: string;
  displayName: string;
}
