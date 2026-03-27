export declare class InvalidPlayerDisplayNameError extends Error {
    constructor(message: string);
}
export declare class PlayerDisplayNameTakenError extends Error {
    constructor(displayName: string);
}
export declare class PlayerNotFoundError extends Error {
    constructor(playerId: string);
}
export declare class InvalidPlayerResourceDeltaError extends Error {
    constructor(message: string);
}
export declare class AccountAlreadyHasPlayerError extends Error {
    constructor();
}
