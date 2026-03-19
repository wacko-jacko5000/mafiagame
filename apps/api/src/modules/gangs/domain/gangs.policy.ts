import { InvalidGangNameError } from "./gangs.errors";
import type { CreateGangValues } from "./gangs.types";

const GANG_NAME_PATTERN = /^[A-Za-z0-9 _-]+$/;
const MIN_GANG_NAME_LENGTH = 3;
const MAX_GANG_NAME_LENGTH = 24;

export function normalizeGangName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function validateGangName(name: string): string {
  const normalizedName = normalizeGangName(name);

  if (
    normalizedName.length < MIN_GANG_NAME_LENGTH ||
    normalizedName.length > MAX_GANG_NAME_LENGTH ||
    !GANG_NAME_PATTERN.test(normalizedName)
  ) {
    throw new InvalidGangNameError();
  }

  return normalizedName;
}

export function buildCreateGangValues(
  playerId: string,
  name: string
): CreateGangValues {
  return {
    playerId,
    name: validateGangName(name)
  };
}
