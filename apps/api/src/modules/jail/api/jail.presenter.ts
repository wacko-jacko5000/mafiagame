import type { JailStatus } from "../domain/jail.types";
import type { JailStatusResponseBody } from "./jail.contracts";

export function toJailStatusResponseBody(
  status: JailStatus
): JailStatusResponseBody {
  return {
    playerId: status.playerId,
    active: status.active,
    until: status.until?.toISOString() ?? null,
    remainingSeconds: status.remainingSeconds
  };
}
