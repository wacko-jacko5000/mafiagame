import type { HospitalStatus } from "../domain/hospital.types";
import type { HospitalStatusResponseBody } from "./hospital.contracts";

export function toHospitalStatusResponseBody(
  status: HospitalStatus
): HospitalStatusResponseBody {
  return {
    playerId: status.playerId,
    active: status.active,
    until: status.until?.toISOString() ?? null,
    remainingSeconds: status.remainingSeconds
  };
}
