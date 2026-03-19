export class SeasonNotFoundError extends Error {
  constructor(seasonId: string) {
    super(`Season "${seasonId}" was not found.`);
    this.name = "SeasonNotFoundError";
  }
}

export class InvalidSeasonNameError extends Error {
  constructor() {
    super("Season name must be between 1 and 64 characters.");
    this.name = "InvalidSeasonNameError";
  }
}

export class InvalidSeasonWindowError extends Error {
  constructor() {
    super("Season end date must be later than the start date.");
    this.name = "InvalidSeasonWindowError";
  }
}

export class SeasonAlreadyInactiveError extends Error {
  constructor(seasonId: string) {
    super(`Season "${seasonId}" is not currently active.`);
    this.name = "SeasonAlreadyInactiveError";
  }
}
