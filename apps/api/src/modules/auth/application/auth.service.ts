import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

import {
  AUTH_REPOSITORY,
  type AuthRepository
} from "./auth.repository";
import {
  AccountEmailTakenError,
  InvalidAuthEmailError,
  InvalidAuthPasswordError,
  InvalidCredentialsError
} from "../domain/auth.errors";
import {
  generateSessionToken,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
  verifyPassword,
  AUTH_SESSION_TTL_DAYS
} from "../domain/auth.policy";
import type {
  AuthActor,
  AuthenticatedSession,
  LoginCommand,
  RegisterAccountCommand
} from "../domain/auth.types";

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepository
  ) {}

  async register(command: RegisterAccountCommand): Promise<AuthenticatedSession> {
    try {
      const email = normalizeEmail(command.email);
      const existingAccount = await this.authRepository.findAccountByEmail(email);

      if (existingAccount) {
        throw new AccountEmailTakenError(email);
      }

      const passwordHash = await hashPassword(command.password);
      const account = await this.authRepository.createAccount({
        email,
        passwordHash
      });

      return this.createSessionForAccount(account.id);
    } catch (error) {
      if (
        error instanceof InvalidAuthEmailError ||
        error instanceof InvalidAuthPasswordError
      ) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof AccountEmailTakenError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  async login(command: LoginCommand): Promise<AuthenticatedSession> {
    try {
      const email = normalizeEmail(command.email);
      const account = await this.authRepository.findAccountByEmail(email);

      if (!account) {
        throw new InvalidCredentialsError();
      }

      const validPassword = await verifyPassword(command.password, account.passwordHash);

      if (!validPassword) {
        throw new InvalidCredentialsError();
      }

      return this.createSessionForAccount(account.id);
    } catch (error) {
      if (
        error instanceof InvalidAuthEmailError ||
        error instanceof InvalidAuthPasswordError
      ) {
        throw new BadRequestException(error.message);
      }

      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }
  }

  async getAccountById(accountId: string) {
    return this.authRepository.findAccountById(accountId);
  }

  async authenticate(accessToken: string): Promise<AuthActor | null> {
    const account = await this.authRepository.findAccountByActiveSessionTokenHash(
      hashSessionToken(accessToken),
      new Date()
    );

    if (!account) {
      return null;
    }

    return {
      accountId: account.id,
      email: account.email,
      playerId: account.player?.id ?? null
    };
  }

  private async createSessionForAccount(
    accountId: string
  ): Promise<AuthenticatedSession> {
    const accessToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + AUTH_SESSION_TTL_DAYS);

    await this.authRepository.createSession({
      accountId,
      tokenHash: hashSessionToken(accessToken),
      expiresAt
    });

    const account = await this.authRepository.findAccountById(accountId);

    if (!account) {
      throw new UnauthorizedException("Authenticated account no longer exists.");
    }

    return {
      accessToken,
      account
    };
  }
}
