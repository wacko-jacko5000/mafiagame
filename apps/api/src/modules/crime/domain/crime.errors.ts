export class CrimeNotFoundError extends Error {
  constructor(crimeId: string) {
    super(`Crime "${crimeId}" was not found.`);
    this.name = "CrimeNotFoundError";
  }
}

export class CrimeLevelLockedError extends Error {
  constructor(crimeName: string, unlockLevel: number) {
    super(`Crime "${crimeName}" unlocks at level ${unlockLevel}.`);
    this.name = "CrimeLevelLockedError";
  }
}

export class InsufficientCrimeEnergyError extends Error {
  constructor(crimeId: string) {
    super(`Player does not have enough energy to execute "${crimeId}".`);
    this.name = "InsufficientCrimeEnergyError";
  }
}

export class CrimeUnavailableWhileJailedError extends Error {
  constructor(until: Date) {
    super(`Player cannot execute crimes while jailed until ${until.toISOString()}.`);
    this.name = "CrimeUnavailableWhileJailedError";
  }
}

export class CrimeUnavailableWhileHospitalizedError extends Error {
  constructor(until: Date) {
    super(
      `Player cannot execute crimes while hospitalized until ${until.toISOString()}.`
    );
    this.name = "CrimeUnavailableWhileHospitalizedError";
  }
}
