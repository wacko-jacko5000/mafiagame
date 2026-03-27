"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildJailReleaseTime = buildJailReleaseTime;
exports.getJailStatus = getJailStatus;
function buildJailReleaseTime(now, durationSeconds) {
    return new Date(now.getTime() + durationSeconds * 1000);
}
function getJailStatus(playerId, jailedUntil, now) {
    if (!jailedUntil || jailedUntil.getTime() <= now.getTime()) {
        return {
            playerId,
            active: false,
            until: null,
            remainingSeconds: 0,
            reason: null
        };
    }
    return {
        playerId,
        active: true,
        until: jailedUntil,
        remainingSeconds: Math.ceil((jailedUntil.getTime() - now.getTime()) / 1000),
        reason: null
    };
}
