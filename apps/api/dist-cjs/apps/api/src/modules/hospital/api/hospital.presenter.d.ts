import type { CustodyBuyoutQuote } from "../../custody/domain/custody.types";
import { toPlayerResponseBody } from "../../player/api/player.presenter";
import type { HospitalStatus } from "../domain/hospital.types";
import type { HospitalBuyoutResponseBody, HospitalBuyoutStatusResponseBody, HospitalStatusResponseBody } from "./hospital.contracts";
export declare function toHospitalStatusResponseBody(status: HospitalStatus): HospitalStatusResponseBody;
export declare function toHospitalBuyoutStatusResponseBody(quote: CustodyBuyoutQuote): HospitalBuyoutStatusResponseBody;
export declare function toHospitalBuyoutResponseBody(input: {
    buyoutPrice: number;
    player: Parameters<typeof toPlayerResponseBody>[0];
}): HospitalBuyoutResponseBody;
