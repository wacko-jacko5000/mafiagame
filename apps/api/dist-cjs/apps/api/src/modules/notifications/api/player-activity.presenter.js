"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPlayerActivityResponseBody = toPlayerActivityResponseBody;
function toPlayerActivityResponseBody(activity) {
    return {
        id: activity.id,
        playerId: activity.playerId,
        type: activity.type,
        title: activity.title,
        body: activity.body,
        createdAt: activity.createdAt.toISOString(),
        readAt: activity.readAt?.toISOString() ?? null
    };
}
