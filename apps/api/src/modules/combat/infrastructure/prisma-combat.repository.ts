import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "../../../platform/database/prisma.service";
import { buildHospitalReleaseTime } from "../../hospital/domain/hospital.policy";
import type { CombatRepository } from "../application/combat.repository";
import type {
  CombatAttackCommand,
  CombatAttackPersistenceResult
} from "../domain/combat.types";

interface CombatPlayerRecord {
  id: string;
  health: number;
  hospitalizedUntil: Date | null;
  hospitalEntryCount: number;
}

interface CombatPrismaTransaction {
  player: {
    findUnique(args: { where: { id: string } }): Promise<CombatPlayerRecord | null>;
    update(args: {
      where: { id: string };
      data: {
        health: number;
        hospitalizedUntil?: Date | null;
        hospitalReason?: string | null;
        hospitalEntryCount?: { increment: number };
      };
    }): Promise<CombatPlayerRecord>;
  };
}

interface CombatPrismaClient {
  $transaction<T>(callback: (tx: CombatPrismaTransaction) => Promise<T>): Promise<T>;
}

@Injectable()
export class PrismaCombatRepository implements CombatRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prismaService: PrismaService
  ) {}

  async applyAttack(
    command: CombatAttackCommand
  ): Promise<CombatAttackPersistenceResult | null> {
    const prismaClient = this.prismaService as unknown as CombatPrismaClient;

    return prismaClient.$transaction(async (tx: CombatPrismaTransaction) => {
      const target = await tx.player.findUnique({
        where: {
          id: command.targetId
        }
      });

      if (!target) {
        return null;
      }

      const targetHealthAfter = Math.max(0, target.health - command.damageDealt);
      const targetHospitalized = targetHealthAfter <= command.hospitalThreshold;
      const hospitalizedUntil = targetHospitalized
        ? buildHospitalReleaseTime(command.now, command.hospitalDurationSeconds)
        : target.hospitalizedUntil;

      const updatedTarget = await tx.player.update({
        where: {
          id: command.targetId
        },
        data: {
          health: targetHealthAfter,
          hospitalizedUntil,
          ...(targetHospitalized
            ? {
                hospitalReason: command.hospitalReason,
                hospitalEntryCount: {
                  increment: 1
                }
              }
            : {})
        }
      });

      return {
        targetHealthBefore: target.health,
        targetHealthAfter: updatedTarget.health,
        targetHospitalized,
        hospitalizedUntil
      };
    });
  }
}
