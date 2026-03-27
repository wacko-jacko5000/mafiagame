import type { CreateGangValues } from "./gangs.types";
export declare function normalizeGangName(name: string): string;
export declare function validateGangName(name: string): string;
export declare function buildCreateGangValues(playerId: string, name: string): CreateGangValues;
