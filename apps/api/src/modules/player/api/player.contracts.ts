export interface CreatePlayerRequestBody {
  displayName: string;
}

export interface PlayerResponseBody {
  id: string;
  displayName: string;
  cash: number;
  respect: number;
  energy: number;
  health: number;
  jailedUntil: string | null;
  hospitalizedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerResourcesResponseBody {
  cash: number;
  respect: number;
  energy: number;
  health: number;
}
