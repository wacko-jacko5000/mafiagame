export class MissionNotFoundError extends Error {
  constructor(missionId: string) {
    super(`Mission "${missionId}" was not found.`);
  }
}

export class MissionLevelLockedError extends Error {
  constructor(missionName: string, unlockLevel: number) {
    super(`Mission "${missionName}" unlocks at level ${unlockLevel}.`);
  }
}

export class MissionAlreadyActiveError extends Error {
  constructor(missionId: string) {
    super(`Mission "${missionId}" is already active for this player.`);
  }
}

export class MissionAlreadyCompletedError extends Error {
  constructor(missionId: string) {
    super(`Mission "${missionId}" has already been completed.`);
  }
}

export class MissionNotAcceptedError extends Error {
  constructor(missionId: string) {
    super(`Mission "${missionId}" has not been accepted.`);
  }
}

export class MissionProgressIncompleteError extends Error {
  constructor(missionId: string) {
    super(`Mission "${missionId}" cannot be completed until its objective is met.`);
  }
}
