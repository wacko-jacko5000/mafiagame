import type { AuthActor } from "../domain/auth.types";

export interface AuthenticatedRequest {
  header(name: string): string | undefined;
  authActor?: AuthActor;
}
