import { Inject, Injectable } from "@nestjs/common";
import type { Account } from "@prisma/client";

import { PrismaService } from "../../../platform/database/prisma.service";
import type {
  AuthRepository,
  CreateAccountValues,
  CreateSessionValues
} from "../application/auth.repository";
import type { AccountSnapshot } from "../domain/auth.types";

function toAccountSnapshot(
  account: Account & {
    player: {
      id: string;
      displayName: string;
    } | null;
  }
): AccountSnapshot {
  return {
    id: account.id,
    email: account.email,
    passwordHash: account.passwordHash,
    isAdmin: account.isAdmin,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
    player: account.player
      ? {
          id: account.player.id,
          displayName: account.player.displayName
        }
      : null
  };
}

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async createAccount(values: CreateAccountValues): Promise<AccountSnapshot> {
    const account = await this.prismaService.account.create({
      data: values,
      include: {
        player: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });

    return toAccountSnapshot(account);
  }

  async createSession(values: CreateSessionValues): Promise<void> {
    await this.prismaService.accountSession.create({
      data: values
    });
  }

  async findAccountByEmail(email: string): Promise<AccountSnapshot | null> {
    const account = await this.prismaService.account.findUnique({
      where: {
        email
      },
      include: {
        player: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });

    return account ? toAccountSnapshot(account) : null;
  }

  async findAccountById(accountId: string): Promise<AccountSnapshot | null> {
    const account = await this.prismaService.account.findUnique({
      where: {
        id: accountId
      },
      include: {
        player: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });

    return account ? toAccountSnapshot(account) : null;
  }

  async markAccountAsAdmin(accountId: string): Promise<AccountSnapshot> {
    const account = await this.prismaService.account.update({
      where: {
        id: accountId
      },
      data: {
        isAdmin: true
      },
      include: {
        player: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });

    return toAccountSnapshot(account);
  }

  async findAccountByActiveSessionTokenHash(
    tokenHash: string,
    now: Date
  ): Promise<AccountSnapshot | null> {
    const session = await this.prismaService.accountSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: now
        }
      },
      include: {
        account: {
          include: {
            player: {
              select: {
                id: true,
                displayName: true
              }
            }
          }
        }
      }
    });

    return session ? toAccountSnapshot(session.account) : null;
  }
}
