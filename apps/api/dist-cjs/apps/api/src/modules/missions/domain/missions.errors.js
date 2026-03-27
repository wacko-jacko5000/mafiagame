"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionProgressIncompleteError = exports.MissionNotAcceptedError = exports.MissionAlreadyCompletedError = exports.MissionAlreadyActiveError = exports.MissionLevelLockedError = exports.MissionNotFoundError = void 0;
class MissionNotFoundError extends Error {
    constructor(missionId) {
        super(`Mission "${missionId}" was not found.`);
    }
}
exports.MissionNotFoundError = MissionNotFoundError;
class MissionLevelLockedError extends Error {
    constructor(missionName, unlockLevel) {
        super(`Mission "${missionName}" unlocks at level ${unlockLevel}.`);
    }
}
exports.MissionLevelLockedError = MissionLevelLockedError;
class MissionAlreadyActiveError extends Error {
    constructor(missionId) {
        super(`Mission "${missionId}" is already active for this player.`);
    }
}
exports.MissionAlreadyActiveError = MissionAlreadyActiveError;
class MissionAlreadyCompletedError extends Error {
    constructor(missionId) {
        super(`Mission "${missionId}" has already been completed.`);
    }
}
exports.MissionAlreadyCompletedError = MissionAlreadyCompletedError;
class MissionNotAcceptedError extends Error {
    constructor(missionId) {
        super(`Mission "${missionId}" has not been accepted.`);
    }
}
exports.MissionNotAcceptedError = MissionNotAcceptedError;
class MissionProgressIncompleteError extends Error {
    constructor(missionId) {
        super(`Mission "${missionId}" cannot be completed until its objective is met.`);
    }
}
exports.MissionProgressIncompleteError = MissionProgressIncompleteError;
