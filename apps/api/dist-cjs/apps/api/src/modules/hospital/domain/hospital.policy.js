"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHospitalReleaseTime = buildHospitalReleaseTime;
exports.getHospitalStatus = getHospitalStatus;
function buildHospitalReleaseTime(now, durationSeconds) {
    return new Date(now.getTime() + durationSeconds * 1000);
}
function getHospitalStatus(playerId, hospitalizedUntil, now) {
    if (!hospitalizedUntil || hospitalizedUntil.getTime() <= now.getTime()) {
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
        until: hospitalizedUntil,
        remainingSeconds: Math.ceil((hospitalizedUntil.getTime() - now.getTime()) / 1000),
        reason: null
    };
}
