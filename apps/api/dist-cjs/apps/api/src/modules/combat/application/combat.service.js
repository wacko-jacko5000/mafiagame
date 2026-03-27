"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatService = void 0;
const common_1 = require("@nestjs/common");
const hospital_service_1 = require("../../hospital/application/hospital.service");
const inventory_service_1 = require("../../inventory/application/inventory.service");
const jail_service_1 = require("../../jail/application/jail.service");
const player_activity_service_1 = require("../../notifications/application/player-activity.service");
const player_service_1 = require("../../player/application/player.service");
const player_errors_1 = require("../../player/domain/player.errors");
const domain_events_service_1 = require("../../../platform/domain-events/domain-events.service");
const combat_constants_1 = require("../domain/combat.constants");
const combat_errors_1 = require("../domain/combat.errors");
const combat_policy_1 = require("../domain/combat.policy");
const combat_repository_1 = require("./combat.repository");
let CombatService = class CombatService {
    playerService;
    jailService;
    hospitalService;
    inventoryService;
    playerActivityService;
    domainEventsService;
    combatRepository;
    constructor(playerService, jailService, hospitalService, inventoryService, playerActivityService, domainEventsService, combatRepository) {
        this.playerService = playerService;
        this.jailService = jailService;
        this.hospitalService = hospitalService;
        this.inventoryService = inventoryService;
        this.playerActivityService = playerActivityService;
        this.domainEventsService = domainEventsService;
        this.combatRepository = combatRepository;
    }
    async attack(attackerId, targetId) {
        if (attackerId === targetId) {
            throw new common_1.ConflictException(new combat_errors_1.SelfAttackNotAllowedError().message);
        }
        const now = new Date();
        const [attacker, target, attackerJail, attackerHospital, targetHospital] = await Promise.all([
            this.playerService.getPlayerById(attackerId),
            this.playerService.getPlayerById(targetId),
            this.jailService.getStatus(attackerId, now),
            this.hospitalService.getStatus(attackerId, now),
            this.hospitalService.getStatus(targetId, now)
        ]);
        if (attackerJail.active && attackerJail.until) {
            throw new common_1.ConflictException(new combat_errors_1.AttackerJailedError(attackerJail.until).message);
        }
        if (attackerHospital.active && attackerHospital.until) {
            throw new common_1.ConflictException(new combat_errors_1.AttackerHospitalizedError(attackerHospital.until).message);
        }
        if (targetHospital.active && targetHospital.until) {
            throw new common_1.ConflictException(new combat_errors_1.TargetHospitalizedError(targetHospital.until).message);
        }
        const [attackerLoadout, targetLoadout] = await Promise.all([
            this.inventoryService.getCombatLoadout(attackerId),
            this.inventoryService.getCombatLoadout(targetId)
        ]);
        const combatResolution = (0, combat_policy_1.resolveCombatAttack)({
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
            attackerLoadout: (0, combat_policy_1.toCombatLoadoutSnapshot)(attackerLoadout),
            targetLoadout: (0, combat_policy_1.toCombatLoadoutSnapshot)(targetLoadout)
        });
        const persistenceResult = await this.combatRepository.applyAttack({
            attackerId,
            targetId,
            damageDealt: combatResolution.damageDealt,
            hospitalThreshold: combat_constants_1.combatRuleSet.hospitalThreshold,
            hospitalDurationSeconds: combat_constants_1.combatRuleSet.hospitalDurationSeconds,
            hospitalReason: `Taken down in combat by ${attacker.displayName}.`,
            now
        });
        if (!persistenceResult) {
            throw new common_1.NotFoundException(new player_errors_1.PlayerNotFoundError(targetId).message);
        }
        if (persistenceResult.targetHospitalized) {
            await this.playerActivityService.createActivity({
                playerId: targetId,
                type: "hospital.entered",
                title: "You are in the hospital",
                createdAt: now,
                body: `Taken down by ${attacker.displayName}. Recovery lasts until ${persistenceResult.hospitalizedUntil?.toISOString()}.`
            });
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
};
exports.CombatService = CombatService;
exports.CombatService = CombatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(player_service_1.PlayerService)),
    __param(1, (0, common_1.Inject)(jail_service_1.JailService)),
    __param(2, (0, common_1.Inject)(hospital_service_1.HospitalService)),
    __param(3, (0, common_1.Inject)(inventory_service_1.InventoryService)),
    __param(4, (0, common_1.Inject)(player_activity_service_1.PlayerActivityService)),
    __param(5, (0, common_1.Inject)(domain_events_service_1.DomainEventsService)),
    __param(6, (0, common_1.Inject)(combat_repository_1.COMBAT_REPOSITORY)),
    __metadata("design:paramtypes", [player_service_1.PlayerService,
        jail_service_1.JailService,
        hospital_service_1.HospitalService,
        inventory_service_1.InventoryService,
        player_activity_service_1.PlayerActivityService,
        domain_events_service_1.DomainEventsService, Object])
], CombatService);
