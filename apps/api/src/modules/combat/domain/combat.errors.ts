export class SelfAttackNotAllowedError extends Error {
  constructor() {
    super("Players cannot attack themselves.");
    this.name = "SelfAttackNotAllowedError";
  }
}

export class AttackerJailedError extends Error {
  constructor(until: Date) {
    super(`Attacker cannot initiate combat while jailed until ${until.toISOString()}.`);
    this.name = "AttackerJailedError";
  }
}

export class AttackerHospitalizedError extends Error {
  constructor(until: Date) {
    super(
      `Attacker cannot initiate combat while hospitalized until ${until.toISOString()}.`
    );
    this.name = "AttackerHospitalizedError";
  }
}

export class TargetHospitalizedError extends Error {
  constructor(until: Date) {
    super(`Target cannot be attacked while hospitalized until ${until.toISOString()}.`);
    this.name = "TargetHospitalizedError";
  }
}
