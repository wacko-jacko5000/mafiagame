"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCredentialsError = exports.AccountEmailTakenError = exports.InvalidAuthPasswordError = exports.InvalidAuthEmailError = void 0;
class InvalidAuthEmailError extends Error {
    constructor() {
        super("Email must be a valid address.");
    }
}
exports.InvalidAuthEmailError = InvalidAuthEmailError;
class InvalidAuthPasswordError extends Error {
    constructor() {
        super("Password must be at least 8 characters long.");
    }
}
exports.InvalidAuthPasswordError = InvalidAuthPasswordError;
class AccountEmailTakenError extends Error {
    constructor(email) {
        super(`An account with email "${email}" already exists.`);
    }
}
exports.AccountEmailTakenError = AccountEmailTakenError;
class InvalidCredentialsError extends Error {
    constructor() {
        super("Invalid email or password.");
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
