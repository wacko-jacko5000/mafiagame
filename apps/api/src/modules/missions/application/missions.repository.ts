import type { PlayerMissionSnapshot } from "../domain/missions.types";

export const MISSIONS_REPOSITORY = Symbol("MISSIONS_REPOSITORY");

export interface CreatePlayerMissionRecord {
  playerId: string;
  missionId: string;
  targetProgress: number;
  acceptedAt: Date;
}

export interface ResetPlayerMissionRecord {
  playerId: string;
  missionId: string;
  targetProgress: number;
  acceptedAt: Date;
}

export interface MissionsRepository {
  findByPlayerAndMissionId(
    playerId: string,
    missionId: string
  ): Promise<PlayerMissionSnapshot | null>;
  listByPlayerId(playerId: string): Promise<PlayerMissionSnapshot[]>;
  listActiveByPlayerId(playerId: string): Promise<PlayerMissionSnapshot[]>;
  createMission(record: CreatePlayerMissionRecord): Promise<PlayerMissionSnapshot>;
  resetMission(record: ResetPlayerMissionRecord): Promise<PlayerMissionSnapshot>;
  updateProgress(
    playerMissionId: string,
    progress: number
  ): Promise<PlayerMissionSnapshot>;
  markCompleted(
    playerMissionId: string,
    completedAt: Date
  ): Promise<PlayerMissionSnapshot>;
}
