export class DistrictNotFoundError extends Error {
  constructor(districtId: string) {
    super(`District "${districtId}" was not found.`);
    this.name = "DistrictNotFoundError";
  }
}

export class DistrictAlreadyControlledError extends Error {
  constructor(districtId: string) {
    super(`District "${districtId}" is already controlled and cannot be directly claimed.`);
    this.name = "DistrictAlreadyControlledError";
  }
}

export class DistrictPayoutUnavailableForUncontrolledDistrictError extends Error {
  constructor(districtId: string) {
    super(`District "${districtId}" is uncontrolled and cannot pay out.`);
    this.name = "DistrictPayoutUnavailableForUncontrolledDistrictError";
  }
}

export class DistrictPayoutGangControlRequiredError extends Error {
  constructor(districtId: string, gangId: string) {
    super(`Gang "${gangId}" does not currently control district "${districtId}".`);
    this.name = "DistrictPayoutGangControlRequiredError";
  }
}

export class DistrictPayoutCooldownNotElapsedError extends Error {
  constructor(districtId: string) {
    super(`District "${districtId}" payout is still on cooldown.`);
    this.name = "DistrictPayoutCooldownNotElapsedError";
  }
}

export class DistrictWarNotFoundError extends Error {
  constructor(warId: string) {
    super(`District war "${warId}" was not found.`);
    this.name = "DistrictWarNotFoundError";
  }
}

export class DistrictWarAlreadyActiveError extends Error {
  constructor(districtId: string) {
    super(`District "${districtId}" already has an active war.`);
    this.name = "DistrictWarAlreadyActiveError";
  }
}

export class DistrictWarUnavailableForUnclaimedDistrictError extends Error {
  constructor(districtId: string) {
    super(`District "${districtId}" is unclaimed and cannot start a war.`);
    this.name = "DistrictWarUnavailableForUnclaimedDistrictError";
  }
}

export class DistrictWarAttackerAlreadyControlsDistrictError extends Error {
  constructor(districtId: string, gangId: string) {
    super(`Gang "${gangId}" already controls district "${districtId}".`);
    this.name = "DistrictWarAttackerAlreadyControlsDistrictError";
  }
}

export class DistrictWarInvalidWinnerError extends Error {
  constructor(warId: string, winningGangId: string) {
    super(`Gang "${winningGangId}" is not a valid winner for district war "${warId}".`);
    this.name = "DistrictWarInvalidWinnerError";
  }
}

export class DistrictWarAlreadyResolvedError extends Error {
  constructor(warId: string) {
    super(`District war "${warId}" is already resolved.`);
    this.name = "DistrictWarAlreadyResolvedError";
  }
}
