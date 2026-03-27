"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistrictWarAlreadyResolvedError = exports.DistrictWarInvalidWinnerError = exports.DistrictWarAttackerAlreadyControlsDistrictError = exports.DistrictWarUnavailableForUnclaimedDistrictError = exports.DistrictWarAlreadyActiveError = exports.DistrictWarNotFoundError = exports.DistrictPayoutCooldownNotElapsedError = exports.DistrictPayoutGangControlRequiredError = exports.DistrictPayoutUnavailableForUncontrolledDistrictError = exports.DistrictAlreadyControlledError = exports.DistrictNotFoundError = void 0;
class DistrictNotFoundError extends Error {
    constructor(districtId) {
        super(`District "${districtId}" was not found.`);
        this.name = "DistrictNotFoundError";
    }
}
exports.DistrictNotFoundError = DistrictNotFoundError;
class DistrictAlreadyControlledError extends Error {
    constructor(districtId) {
        super(`District "${districtId}" is already controlled and cannot be directly claimed.`);
        this.name = "DistrictAlreadyControlledError";
    }
}
exports.DistrictAlreadyControlledError = DistrictAlreadyControlledError;
class DistrictPayoutUnavailableForUncontrolledDistrictError extends Error {
    constructor(districtId) {
        super(`District "${districtId}" is uncontrolled and cannot pay out.`);
        this.name = "DistrictPayoutUnavailableForUncontrolledDistrictError";
    }
}
exports.DistrictPayoutUnavailableForUncontrolledDistrictError = DistrictPayoutUnavailableForUncontrolledDistrictError;
class DistrictPayoutGangControlRequiredError extends Error {
    constructor(districtId, gangId) {
        super(`Gang "${gangId}" does not currently control district "${districtId}".`);
        this.name = "DistrictPayoutGangControlRequiredError";
    }
}
exports.DistrictPayoutGangControlRequiredError = DistrictPayoutGangControlRequiredError;
class DistrictPayoutCooldownNotElapsedError extends Error {
    constructor(districtId) {
        super(`District "${districtId}" payout is still on cooldown.`);
        this.name = "DistrictPayoutCooldownNotElapsedError";
    }
}
exports.DistrictPayoutCooldownNotElapsedError = DistrictPayoutCooldownNotElapsedError;
class DistrictWarNotFoundError extends Error {
    constructor(warId) {
        super(`District war "${warId}" was not found.`);
        this.name = "DistrictWarNotFoundError";
    }
}
exports.DistrictWarNotFoundError = DistrictWarNotFoundError;
class DistrictWarAlreadyActiveError extends Error {
    constructor(districtId) {
        super(`District "${districtId}" already has an active war.`);
        this.name = "DistrictWarAlreadyActiveError";
    }
}
exports.DistrictWarAlreadyActiveError = DistrictWarAlreadyActiveError;
class DistrictWarUnavailableForUnclaimedDistrictError extends Error {
    constructor(districtId) {
        super(`District "${districtId}" is unclaimed and cannot start a war.`);
        this.name = "DistrictWarUnavailableForUnclaimedDistrictError";
    }
}
exports.DistrictWarUnavailableForUnclaimedDistrictError = DistrictWarUnavailableForUnclaimedDistrictError;
class DistrictWarAttackerAlreadyControlsDistrictError extends Error {
    constructor(districtId, gangId) {
        super(`Gang "${gangId}" already controls district "${districtId}".`);
        this.name = "DistrictWarAttackerAlreadyControlsDistrictError";
    }
}
exports.DistrictWarAttackerAlreadyControlsDistrictError = DistrictWarAttackerAlreadyControlsDistrictError;
class DistrictWarInvalidWinnerError extends Error {
    constructor(warId, winningGangId) {
        super(`Gang "${winningGangId}" is not a valid winner for district war "${warId}".`);
        this.name = "DistrictWarInvalidWinnerError";
    }
}
exports.DistrictWarInvalidWinnerError = DistrictWarInvalidWinnerError;
class DistrictWarAlreadyResolvedError extends Error {
    constructor(warId) {
        super(`District war "${warId}" is already resolved.`);
        this.name = "DistrictWarAlreadyResolvedError";
    }
}
exports.DistrictWarAlreadyResolvedError = DistrictWarAlreadyResolvedError;
