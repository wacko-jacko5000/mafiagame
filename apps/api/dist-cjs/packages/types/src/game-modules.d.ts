export type ModuleKey = "auth" | "player" | "stats" | "crime" | "jail" | "hospital" | "combat" | "inventory" | "economy" | "businesses" | "gangs" | "territory" | "missions" | "market" | "notifications" | "live-events" | "leaderboard" | "admin-tools";
export interface ModuleManifest {
    key: ModuleKey;
    name: string;
    purpose: string;
    dependsOn: ModuleKey[];
    emits: string[];
    consumes: string[];
}
export declare const moduleCatalog: readonly ModuleManifest[];
