import type { PlayerSnapshot } from "../domain/player.types";
import type { PlayerResponseBody, PlayerResourcesResponseBody } from "./player.contracts";
export declare function toPlayerResponseBody(player: PlayerSnapshot): PlayerResponseBody;
export declare function toPlayerResourcesResponseBody(resources: PlayerResourcesResponseBody): PlayerResourcesResponseBody;
