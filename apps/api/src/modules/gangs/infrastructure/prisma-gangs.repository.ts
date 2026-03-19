import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../../platform/database/prisma.service";
import {
  GangNameTakenError,
  PlayerAlreadyInGangError
} from "../domain/gangs.errors";
import type {
  CreateGangValues,
  GangInviteSnapshot,
  GangMemberSnapshot,
  GangSnapshot,
  LeaveGangPersistenceCommand,
  LeaveGangPersistenceResult,
  ResolveGangInvitePersistenceResult
} from "../domain/gangs.types";
import type { GangsRepository } from "../application/gangs.repository";

interface GangRecord {
  id: string;
  name: string;
  createdAt: Date;
  createdByPlayerId: string;
}

interface GangMemberRecord {
  id: string;
  gangId: string;
  playerId: string;
  role: "leader" | "member";
  joinedAt: Date;
}

interface GangInviteRecord {
  id: string;
  gangId: string;
  invitedPlayerId: string;
  invitedByPlayerId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

interface GangsPrismaTransaction {
  gang: {
    create(args: {
      data: { name: string; createdByPlayerId: string };
    }): Promise<GangRecord>;
    delete(args: { where: { id: string } }): Promise<GangRecord>;
  };
  gangMember: {
    create(args: {
      data: { gangId: string; playerId: string; role: "leader" | "member" };
    }): Promise<GangMemberRecord>;
    delete(args: { where: { id: string } }): Promise<GangMemberRecord>;
    findUnique(args: { where: { playerId: string } }): Promise<GangMemberRecord | null>;
  };
  gangInvite: {
    create(args: {
      data: {
        gangId: string;
        invitedPlayerId: string;
        invitedByPlayerId: string;
        status: "pending";
      };
    }): Promise<GangInviteRecord>;
    findUnique(args: { where: { id: string } }): Promise<GangInviteRecord | null>;
    findFirst(args: {
      where: { invitedPlayerId?: string; status?: "pending"; gangId?: string };
      orderBy: { createdAt: "asc" | "desc" };
    }): Promise<GangInviteRecord | null>;
    findMany(args: {
      where: { gangId?: string; invitedPlayerId?: string };
      orderBy: { createdAt: "asc" | "desc" };
    }): Promise<GangInviteRecord[]>;
    update(args: {
      where: { id: string };
      data: { status: "accepted" | "declined" };
    }): Promise<GangInviteRecord>;
  };
}

interface GangsPrismaClient {
  gang: {
    findUnique(args: {
      where: { id?: string; name?: string };
    }): Promise<GangRecord | null>;
  };
  gangMember: {
    count(args: { where: { gangId: string } }): Promise<number>;
    create(args: {
      data: { gangId: string; playerId: string; role: "leader" | "member" };
    }): Promise<GangMemberRecord>;
    findMany(args: {
      where: { gangId: string };
      orderBy: { joinedAt: "asc" | "desc" };
    }): Promise<GangMemberRecord[]>;
    findUnique(args: { where: { playerId: string } }): Promise<GangMemberRecord | null>;
  };
  gangInvite: {
    create(args: {
      data: {
        gangId: string;
        invitedPlayerId: string;
        invitedByPlayerId: string;
        status: "pending";
      };
    }): Promise<GangInviteRecord>;
    findUnique(args: { where: { id: string } }): Promise<GangInviteRecord | null>;
    findFirst(args: {
      where: { invitedPlayerId?: string; status?: "pending"; gangId?: string };
      orderBy: { createdAt: "asc" | "desc" };
    }): Promise<GangInviteRecord | null>;
    findMany(args: {
      where: { gangId?: string; invitedPlayerId?: string };
      orderBy: { createdAt: "asc" | "desc" };
    }): Promise<GangInviteRecord[]>;
  };
  $transaction<T>(callback: (tx: GangsPrismaTransaction) => Promise<T>): Promise<T>;
}

function toGangSnapshot(gang: GangRecord): GangSnapshot {
  return {
    id: gang.id,
    name: gang.name,
    createdAt: gang.createdAt,
    createdByPlayerId: gang.createdByPlayerId
  };
}

function toGangMemberSnapshot(member: GangMemberRecord): GangMemberSnapshot {
  return {
    id: member.id,
    gangId: member.gangId,
    playerId: member.playerId,
    role: member.role,
    joinedAt: member.joinedAt
  };
}

function toGangInviteSnapshot(invite: GangInviteRecord): GangInviteSnapshot {
  return {
    id: invite.id,
    gangId: invite.gangId,
    invitedPlayerId: invite.invitedPlayerId,
    invitedByPlayerId: invite.invitedByPlayerId,
    status: invite.status,
    createdAt: invite.createdAt
  };
}

@Injectable()
export class PrismaGangsRepository implements GangsRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async createGang(
    values: CreateGangValues
  ): Promise<{ gang: GangSnapshot; membership: GangMemberSnapshot }> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;

    try {
      return await prismaClient.$transaction(async (tx: GangsPrismaTransaction) => {
        const gang = await tx.gang.create({
          data: {
            name: values.name,
            createdByPlayerId: values.playerId
          }
        });
        const membership = await tx.gangMember.create({
          data: {
            gangId: gang.id,
            playerId: values.playerId,
            role: "leader"
          }
        });

        return {
          gang: toGangSnapshot(gang),
          membership: toGangMemberSnapshot(membership)
        };
      });
    } catch (error) {
      this.rethrowUniqueConstraintError(error, values);
      throw error;
    }
  }

  async countGangMembers(gangId: string): Promise<number> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;
    return prismaClient.gangMember.count({
      where: {
        gangId
      }
    });
  }

  async findGangById(gangId: string): Promise<GangSnapshot | null> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;
    const gang = await prismaClient.gang.findUnique({
      where: {
        id: gangId
      }
    });

    return gang ? toGangSnapshot(gang) : null;
  }

  async findGangByName(name: string): Promise<GangSnapshot | null> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;
    const gang = await prismaClient.gang.findUnique({
      where: {
        name
      }
    });

    return gang ? toGangSnapshot(gang) : null;
  }

  async findMembershipByPlayerId(playerId: string): Promise<GangMemberSnapshot | null> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;
    const membership = await prismaClient.gangMember.findUnique({
      where: {
        playerId
      }
    });

    return membership ? toGangMemberSnapshot(membership) : null;
  }

  async joinGang(command: {
    gangId: string;
    playerId: string;
  }): Promise<GangMemberSnapshot | null> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;

    try {
      const membership = await prismaClient.gangMember.create({
        data: {
          gangId: command.gangId,
          playerId: command.playerId,
          role: "member"
        }
      });

      return toGangMemberSnapshot(membership);
    } catch (error) {
      this.rethrowUniqueConstraintError(error, {
        playerId: command.playerId,
        name: ""
      });

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        return null;
      }

      throw error;
    }
  }

  async leaveGang(
    command: LeaveGangPersistenceCommand
  ): Promise<LeaveGangPersistenceResult | null> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;

    return prismaClient.$transaction(async (tx: GangsPrismaTransaction) => {
      const membership = await tx.gangMember.findUnique({
        where: {
          playerId: command.playerId
        }
      });

      if (!membership || membership.gangId !== command.gangId) {
        return null;
      }

      const deletedMembership = await tx.gangMember.delete({
        where: {
          id: membership.id
        }
      });

      if (command.deleteGang) {
        await tx.gang.delete({
          where: {
            id: command.gangId
          }
        });
      }

      return {
        membership: toGangMemberSnapshot(deletedMembership),
        gangDeleted: command.deleteGang
      };
    });
  }

  async createInvite(command: {
    gangId: string;
    invitedPlayerId: string;
    invitedByPlayerId: string;
  }): Promise<GangInviteSnapshot | null> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;

    try {
      const invite = await prismaClient.gangInvite.create({
        data: {
          gangId: command.gangId,
          invitedPlayerId: command.invitedPlayerId,
          invitedByPlayerId: command.invitedByPlayerId,
          status: "pending"
        }
      });

      return toGangInviteSnapshot(invite);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        return null;
      }

      throw error;
    }
  }

  async findInviteById(inviteId: string): Promise<GangInviteSnapshot | null> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;
    const invite = await prismaClient.gangInvite.findUnique({
      where: {
        id: inviteId
      }
    });

    return invite ? toGangInviteSnapshot(invite) : null;
  }

  async findPendingInviteByPlayerId(playerId: string): Promise<GangInviteSnapshot | null> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;
    const invite = await prismaClient.gangInvite.findFirst({
      where: {
        invitedPlayerId: playerId,
        status: "pending"
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return invite ? toGangInviteSnapshot(invite) : null;
  }

  async listGangInvites(gangId: string): Promise<GangInviteSnapshot[]> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;
    const invites = await prismaClient.gangInvite.findMany({
      where: {
        gangId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return invites.map(toGangInviteSnapshot);
  }

  async listPlayerGangInvites(playerId: string): Promise<GangInviteSnapshot[]> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;
    const invites = await prismaClient.gangInvite.findMany({
      where: {
        invitedPlayerId: playerId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return invites.map(toGangInviteSnapshot);
  }

  async acceptInvite(command: {
    inviteId: string;
    playerId: string;
  }): Promise<ResolveGangInvitePersistenceResult | null> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;

    return prismaClient.$transaction(async (tx: GangsPrismaTransaction) => {
      const invite = await tx.gangInvite.findUnique({
        where: {
          id: command.inviteId
        }
      });

      if (!invite || invite.invitedPlayerId !== command.playerId || invite.status !== "pending") {
        return null;
      }

      const membership = await tx.gangMember.create({
        data: {
          gangId: invite.gangId,
          playerId: invite.invitedPlayerId,
          role: "member"
        }
      });

      const acceptedInvite = await tx.gangInvite.update({
        where: {
          id: invite.id
        },
        data: {
          status: "accepted"
        }
      });

      return {
        invite: toGangInviteSnapshot(acceptedInvite),
        membership: toGangMemberSnapshot(membership)
      };
    });
  }

  async declineInvite(command: {
    inviteId: string;
    playerId: string;
  }): Promise<GangInviteSnapshot | null> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;

    return prismaClient.$transaction(async (tx: GangsPrismaTransaction) => {
      const invite = await tx.gangInvite.findUnique({
        where: {
          id: command.inviteId
        }
      });

      if (!invite || invite.invitedPlayerId !== command.playerId || invite.status !== "pending") {
        return null;
      }

      const declinedInvite = await tx.gangInvite.update({
        where: {
          id: invite.id
        },
        data: {
          status: "declined"
        }
      });

      return toGangInviteSnapshot(declinedInvite);
    });
  }

  async listGangMembers(gangId: string): Promise<GangMemberSnapshot[]> {
    const prismaClient = this.prismaService as unknown as GangsPrismaClient;
    const memberships = await prismaClient.gangMember.findMany({
      where: {
        gangId
      },
      orderBy: {
        joinedAt: "asc"
      }
    });

    return memberships.map(toGangMemberSnapshot);
  }

  private rethrowUniqueConstraintError(
    error: unknown,
    values: { playerId: string; name: string }
  ) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.join(",") : "";

      if (target.includes("name")) {
        throw new GangNameTakenError(values.name);
      }

      if (target.includes("playerId")) {
        throw new PlayerAlreadyInGangError(values.playerId);
      }
    }
  }
}
