"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareLeaderboardMetricRecords = compareLeaderboardMetricRecords;
function compareLeaderboardMetricRecords(left, right) {
    if (left.metricValue !== right.metricValue) {
        return right.metricValue - left.metricValue;
    }
    if (left.createdAt.getTime() !== right.createdAt.getTime()) {
        return left.createdAt.getTime() - right.createdAt.getTime();
    }
    return left.playerId.localeCompare(right.playerId);
}
