import type { CustodyBuyoutQuote } from "../../custody/domain/custody.types";
import { toPlayerResponseBody } from "../../player/api/player.presenter";
import type { JailStatus } from "../domain/jail.types";
import type { JailBuyoutResponseBody, JailBuyoutStatusResponseBody, JailStatusResponseBody } from "./jail.contracts";
export declare function toJailStatusResponseBody(status: JailStatus): JailStatusResponseBody;
export declare function toJailBuyoutStatusResponseBody(quote: CustodyBuyoutQuote): JailBuyoutStatusResponseBody;
export declare function toJailBuyoutResponseBody(input: {
    buyoutPrice: number;
    player: Parameters<typeof toPlayerResponseBody>[0];
}): JailBuyoutResponseBody;
