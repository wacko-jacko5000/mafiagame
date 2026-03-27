import { CustodyBalanceService } from "../../custody/application/custody-balance.service";
import { PlayerActivityService } from "../../notifications/application/player-activity.service";
import { PlayerService } from "../../player/application/player.service";
import type { HospitalStatus } from "../domain/hospital.types";
export declare class HospitalService {
    private readonly custodyBalanceService;
    private readonly playerActivityService;
    private readonly playerService;
    constructor(custodyBalanceService: CustodyBalanceService, playerActivityService: PlayerActivityService, playerService: PlayerService);
    getStatus(playerId: string, now?: Date): Promise<HospitalStatus>;
    hospitalizePlayer(playerId: string, durationSeconds: number, reason?: string | null, now?: Date): Promise<HospitalStatus>;
    getBuyoutQuote(playerId: string, now?: Date): Promise<import("../../custody/domain/custody.types").CustodyBuyoutQuote>;
    buyOut(playerId: string, now?: Date): Promise<{
        player: import("../../player/domain/player.types").PlayerSnapshot;
        buyoutPrice: number;
    }>;
    assertCrimeExecutionAllowed(playerId: string, now?: Date): Promise<void>;
}
