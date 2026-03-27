import { PrismaService } from "../../../platform/database/prisma.service";
import type { CombatRepository } from "../application/combat.repository";
import type { CombatAttackCommand, CombatAttackPersistenceResult } from "../domain/combat.types";
export declare class PrismaCombatRepository implements CombatRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    applyAttack(command: CombatAttackCommand): Promise<CombatAttackPersistenceResult | null>;
}
