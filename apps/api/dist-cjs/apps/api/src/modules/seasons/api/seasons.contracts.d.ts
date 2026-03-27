export interface SeasonResponseBody {
    id: string;
    name: string;
    status: "draft" | "active" | "inactive";
    startsAt: string | null;
    endsAt: string | null;
    activatedAt: string | null;
    deactivatedAt: string | null;
    createdAt: string;
}
export interface CurrentSeasonResponseBody {
    season: SeasonResponseBody | null;
}
