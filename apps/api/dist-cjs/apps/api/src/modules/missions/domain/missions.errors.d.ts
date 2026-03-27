export declare class MissionNotFoundError extends Error {
    constructor(missionId: string);
}
export declare class MissionLevelLockedError extends Error {
    constructor(missionName: string, unlockLevel: number);
}
export declare class MissionAlreadyActiveError extends Error {
    constructor(missionId: string);
}
export declare class MissionAlreadyCompletedError extends Error {
    constructor(missionId: string);
}
export declare class MissionNotAcceptedError extends Error {
    constructor(missionId: string);
}
export declare class MissionProgressIncompleteError extends Error {
    constructor(missionId: string);
}
