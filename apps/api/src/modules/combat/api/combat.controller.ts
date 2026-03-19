import { Controller, Inject, Param, ParseUUIDPipe, Post } from "@nestjs/common";

import { CombatService } from "../application/combat.service";
import type { CombatAttackResponseBody } from "./combat.contracts";
import { toCombatAttackResponseBody } from "./combat.presenter";

@Controller("combat")
export class CombatController {
  constructor(
    @Inject(CombatService)
    private readonly combatService: CombatService
  ) {}

  @Post("players/:attackerId/attack/:targetId")
  async attack(
    @Param("attackerId", ParseUUIDPipe) attackerId: string,
    @Param("targetId", ParseUUIDPipe) targetId: string
  ): Promise<CombatAttackResponseBody> {
    const result = await this.combatService.attack(attackerId, targetId);
    return toCombatAttackResponseBody(result);
  }
}
