import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { HospitalService } from "../../hospital/application/hospital.service";
import { InventoryService } from "../../inventory/application/inventory.service";
import { JailService } from "../../jail/application/jail.service";
import { PlayerService } from "../../player/application/player.service";
import { PlayerNotFoundError } from "../../player/domain/player.errors";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import { combatRuleSet } from "../domain/combat.constants";
import {
  AttackerHospitalizedError,
  AttackerJailedError,
  SelfAttackNotAllowedError,
  TargetHospitalizedError
} from "../domain/combat.errors";
import {
  resolveCombatAttack,
  toCombatLoadoutSnapshot
} from "../domain/combat.policy";
import type { CombatResult } from "../domain/combat.types";
import {
  COMBAT_REPOSITORY,
  type CombatRepository
} from "./combat.repository";

@Injectable()
export class CombatService {
  constructor(
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(JailService)
    private readonly jailService: JailService,
    @Inject(HospitalService)
    private readonly hospitalService: HospitalService,
    @Inject(InventoryService)
    private readonly inventoryService: InventoryService,
    @Inject(DomainEventsService)
    private readonly domainEventsService: DomainEventsService,
    @Inject(COMBAT_REPOSITORY)
    private readonly combatRepository: CombatRepository
  ) {}

  async attack(attackerId: string, targetId: string): Promise<CombatResult> {
    if (attackerId === targetId) {
      throw new ConflictException(new SelfAttackNotAllowedError().message);
    }

    const now = new Date();
    const [attacker, target, attackerJail, attackerHospital, targetHospital] =
      await Promise.all([
        this.playerService.getPlayerById(attackerId),
        this.playerService.getPlayerById(targetId),
        this.jailService.getStatus(attackerId, now),
        this.hospitalService.getStatus(attackerId, now),
        this.hospitalService.getStatus(targetId, now)
      ]);

    if (attackerJail.active && attackerJail.until) {
      throw new ConflictException(new AttackerJailedError(attackerJail.until).message);
    }

    if (attackerHospital.active && attackerHospital.until) {
      throw new ConflictException(
        new AttackerHospitalizedError(attackerHospital.until).message
      );
    }

    if (targetHospital.active && targetHospital.until) {
      throw new ConflictException(new TargetHospitalizedError(targetHospital.until).message);
    }

    const [attackerLoadout, targetLoadout] = await Promise.all([
      this.inventoryService.getCombatLoadout(attackerId),
      this.inventoryService.getCombatLoadout(targetId)
    ]);

    const combatResolution = resolveCombatAttack({
      attacker: {
        id: attacker.id,
        displayName: attacker.displayName,
        health: attacker.health
      },
      target: {
        id: target.id,
        displayName: target.displayName,
        health: target.health
      },
      attackerLoadout: toCombatLoadoutSnapshot(attackerLoadout),
      targetLoadout: toCombatLoadoutSnapshot(targetLoadout)
    });

    const persistenceResult = await this.combatRepository.applyAttack({
      attackerId,
      targetId,
      damageDealt: combatResolution.damageDealt,
      hospitalThreshold: combatRuleSet.hospitalThreshold,
      hospitalDurationSeconds: combatRuleSet.hospitalDurationSeconds,
      now
    });

    if (!persistenceResult) {
      throw new NotFoundException(new PlayerNotFoundError(targetId).message);
    }

    if (persistenceResult.targetHospitalized) {
      await this.domainEventsService.publish({
        type: "combat.won",
        occurredAt: now,
        attackerPlayerId: attackerId,
        targetPlayerId: targetId,
        damageDealt: combatResolution.damageDealt,
        hospitalizedUntil: persistenceResult.hospitalizedUntil
      });
    }

    return {
      attackerId,
      targetId,
      attackerWeaponItemId: attackerLoadout.weapon?.itemId ?? null,
      targetArmorItemId: targetLoadout.armor?.itemId ?? null,
      baseAttack: combatResolution.baseAttack,
      weaponBonus: combatResolution.weaponBonus,
      armorReduction: combatResolution.armorReduction,
      damageDealt: combatResolution.damageDealt,
      targetHealthBefore: persistenceResult.targetHealthBefore,
      targetHealthAfter: persistenceResult.targetHealthAfter,
      targetHospitalized: persistenceResult.targetHospitalized,
      hospitalizedUntil: persistenceResult.hospitalizedUntil
    };
  }
}
