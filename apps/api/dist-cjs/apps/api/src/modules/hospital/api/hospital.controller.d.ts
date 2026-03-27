import type { AuthActor } from "../../auth/domain/auth.types";
import { HospitalService } from "../application/hospital.service";
import type { HospitalBuyoutResponseBody, HospitalBuyoutStatusResponseBody, HospitalStatusResponseBody } from "./hospital.contracts";
export declare class HospitalController {
    private readonly hospitalService;
    constructor(hospitalService: HospitalService);
    getStatus(playerId: string): Promise<HospitalStatusResponseBody>;
    getCurrentPlayerStatus(actor: AuthActor | undefined): Promise<HospitalBuyoutStatusResponseBody>;
    buyOutCurrentPlayer(actor: AuthActor | undefined): Promise<HospitalBuyoutResponseBody>;
}
