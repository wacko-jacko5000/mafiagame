"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_SESSION_TTL_DAYS = void 0;
exports.normalizeEmail = normalizeEmail;
exports.assertValidPassword = assertValidPassword;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateSessionToken = generateSessionToken;
exports.hashSessionToken = hashSessionToken;
const node_crypto_1 = require("node:crypto");
const node_util_1 = require("node:util");
const auth_errors_1 = require("./auth.errors");
const scrypt = (0, node_util_1.promisify)(node_crypto_1.scrypt);
exports.AUTH_SESSION_TTL_DAYS = 30;
function normalizeEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new auth_errors_1.InvalidAuthEmailError();
    }
    return normalizedEmail;
}
function assertValidPassword(password) {
    if (password.length < 8) {
        throw new auth_errors_1.InvalidAuthPasswordError();
    }
}
async function hashPassword(password) {
    assertValidPassword(password);
    const salt = (0, node_crypto_1.randomBytes)(16).toString("hex");
    const derivedKey = (await scrypt(password, salt, 64));
    return `${salt}:${derivedKey.toString("hex")}`;
}
async function verifyPassword(password, storedHash) {
    const [salt, hashedPassword] = storedHash.split(":");
    if (!salt || !hashedPassword) {
        return false;
    }
    const derivedKey = (await scrypt(password, salt, 64));
    const storedBuffer = Buffer.from(hashedPassword, "hex");
    const derivedBuffer = Buffer.from(derivedKey);
    if (storedBuffer.length !== derivedBuffer.length) {
        return false;
    }
    return (0, node_crypto_1.timingSafeEqual)(storedBuffer, derivedBuffer);
}
function generateSessionToken() {
    return (0, node_crypto_1.randomBytes)(32).toString("hex");
}
function hashSessionToken(token) {
    return (0, node_crypto_1.createHash)("sha256").update(token).digest("hex");
}
