export class PlayerHospitalizedError extends Error {
  constructor(until: Date) {
    super(`Player is hospitalized until ${until.toISOString()}.`);
    this.name = "PlayerHospitalizedError";
  }
}
