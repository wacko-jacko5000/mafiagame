export interface AccountPlayerOwnership {
    id: string;
    displayName: string;
}
export interface AccountSnapshot {
    id: string;
    email: string;
    passwordHash: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
    player: AccountPlayerOwnership | null;
}
export interface AuthActor {
    accountId: string;
    email: string;
    isAdmin: boolean;
    playerId: string | null;
}
export interface RegisterAccountCommand {
    email: string;
    password: string;
}
export interface LoginCommand {
    email: string;
    password: string;
}
export interface AuthenticatedSession {
    accessToken: string;
    account: AccountSnapshot;
}
