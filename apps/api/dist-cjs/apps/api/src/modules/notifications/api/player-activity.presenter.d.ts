import type { PlayerActivitySnapshot } from "../domain/player-activity.types";
import type { PlayerActivityResponseBody } from "./player-activity.contracts";
export declare function toPlayerActivityResponseBody(activity: PlayerActivitySnapshot): PlayerActivityResponseBody;
