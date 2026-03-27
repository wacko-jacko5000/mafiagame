import { HospitalService } from "../../hospital/application/hospital.service";
import { InventoryService } from "../../inventory/application/inventory.service";
import { JailService } from "../../jail/application/jail.service";
import { PlayerActivityService } from "../../notifications/application/player-activity.service";
import { PlayerService } from "../../player/application/player.service";
import { DomainEventsService } from "../../../platform/domain-events/domain-events.service";
import type { CombatResult } from "../domain/combat.types";
import { type CombatRepository } from "./combat.repository";
export declare class CombatService {
    private readonly playerService;
    private readonly jailService;
    private readonly hospitalService;
    private readonly inventoryService;
    private readonly playerActivityService;
    private readonly domainEventsService;
    private readonly combatRepository;
    constructor(playerService: PlayerService, jailService: JailService, hospitalService: HospitalService, inventoryService: InventoryService, playerActivityService: PlayerActivityService, domainEventsService: DomainEventsService, combatRepository: CombatRepository);
    attack(attackerId: string, targetId: string): Promise<CombatResult>;
}
