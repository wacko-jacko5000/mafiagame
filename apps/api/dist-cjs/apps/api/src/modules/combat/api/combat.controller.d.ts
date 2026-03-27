import { CombatService } from "../application/combat.service";
import type { CombatAttackResponseBody } from "./combat.contracts";
export declare class CombatController {
    private readonly combatService;
    constructor(combatService: CombatService);
    attack(attackerId: string, targetId: string): Promise<CombatAttackResponseBody>;
}
