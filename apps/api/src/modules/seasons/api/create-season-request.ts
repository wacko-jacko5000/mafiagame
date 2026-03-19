import { BadRequestException } from "@nestjs/common";

import type { CreateSeasonInput } from "../domain/season.types";

interface CreateSeasonBody {
  name?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
}

export function parseCreateSeasonRequest(body: unknown): CreateSeasonInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new BadRequestException("Season payload must be an object.");
  }

  const { name, startsAt, endsAt } = body as CreateSeasonBody;

  if (typeof name !== "string") {
    throw new BadRequestException("Season name is required.");
  }

  return {
    name,
    startsAt: parseOptionalDate(startsAt, "startsAt"),
    endsAt: parseOptionalDate(endsAt, "endsAt")
  };
}

function parseOptionalDate(value: unknown, fieldName: string): Date | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new BadRequestException(`${fieldName} must be an ISO-8601 date string.`);
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new BadRequestException(`${fieldName} must be an ISO-8601 date string.`);
  }

  return parsedDate;
}
