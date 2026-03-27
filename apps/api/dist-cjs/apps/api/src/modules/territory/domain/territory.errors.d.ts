export declare class DistrictNotFoundError extends Error {
    constructor(districtId: string);
}
export declare class DistrictAlreadyControlledError extends Error {
    constructor(districtId: string);
}
export declare class DistrictPayoutUnavailableForUncontrolledDistrictError extends Error {
    constructor(districtId: string);
}
export declare class DistrictPayoutGangControlRequiredError extends Error {
    constructor(districtId: string, gangId: string);
}
export declare class DistrictPayoutCooldownNotElapsedError extends Error {
    constructor(districtId: string);
}
export declare class DistrictWarNotFoundError extends Error {
    constructor(warId: string);
}
export declare class DistrictWarAlreadyActiveError extends Error {
    constructor(districtId: string);
}
export declare class DistrictWarUnavailableForUnclaimedDistrictError extends Error {
    constructor(districtId: string);
}
export declare class DistrictWarAttackerAlreadyControlsDistrictError extends Error {
    constructor(districtId: string, gangId: string);
}
export declare class DistrictWarInvalidWinnerError extends Error {
    constructor(warId: string, winningGangId: string);
}
export declare class DistrictWarAlreadyResolvedError extends Error {
    constructor(warId: string);
}
