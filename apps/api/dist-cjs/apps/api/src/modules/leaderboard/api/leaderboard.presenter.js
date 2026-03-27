"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLeaderboardDefinitionResponseBody = toLeaderboardDefinitionResponseBody;
exports.toLeaderboardEntryResponseBody = toLeaderboardEntryResponseBody;
exports.toLeaderboardResponseBody = toLeaderboardResponseBody;
function toLeaderboardDefinitionResponseBody(definition) {
    return {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        metricKey: definition.metricKey,
        defaultLimit: definition.defaultLimit,
        maxLimit: definition.maxLimit
    };
}
function toLeaderboardEntryResponseBody(entry) {
    return {
        rank: entry.rank,
        playerId: entry.playerId,
        displayName: entry.displayName,
        metricValue: entry.metricValue
    };
}
function toLeaderboardResponseBody(leaderboard) {
    return {
        ...toLeaderboardDefinitionResponseBody(leaderboard.definition),
        limit: leaderboard.limit,
        entries: leaderboard.entries.map(toLeaderboardEntryResponseBody)
    };
}
