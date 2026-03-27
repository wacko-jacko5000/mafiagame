"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAuthSessionResponseBody = toAuthSessionResponseBody;
exports.toAuthMeResponseBody = toAuthMeResponseBody;
function toAuthenticatedAccountResponseBody(account) {
    return {
        id: account.id,
        email: account.email,
        isAdmin: account.isAdmin,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
        player: account.player
            ? {
                id: account.player.id,
                displayName: account.player.displayName
            }
            : null
    };
}
function toAuthSessionResponseBody(session) {
    return {
        accessToken: session.accessToken,
        account: toAuthenticatedAccountResponseBody(session.account)
    };
}
function toAuthMeResponseBody(account) {
    return {
        account: toAuthenticatedAccountResponseBody(account)
    };
}
