export class InvalidAuthEmailError extends Error {
  constructor() {
    super("Email must be a valid address.");
  }
}

export class InvalidAuthPasswordError extends Error {
  constructor() {
    super("Password must be at least 8 characters long.");
  }
}

export class AccountEmailTakenError extends Error {
  constructor(email: string) {
    super(`An account with email "${email}" already exists.`);
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password.");
  }
}
