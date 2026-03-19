import type { SeasonSnapshot } from "../domain/season.types";
import type { SeasonResponseBody } from "./seasons.contracts";

export function toSeasonResponseBody(season: SeasonSnapshot): SeasonResponseBody {
  return {
    id: season.id,
    name: season.name,
    status: season.status,
    startsAt: season.startsAt?.toISOString() ?? null,
    endsAt: season.endsAt?.toISOString() ?? null,
    activatedAt: season.activatedAt?.toISOString() ?? null,
    deactivatedAt: season.deactivatedAt?.toISOString() ?? null,
    createdAt: season.createdAt.toISOString()
  };
}
