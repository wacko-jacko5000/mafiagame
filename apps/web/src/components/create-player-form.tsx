"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "../lib/api-client";
import { useSession } from "./providers/session-provider";

export function CreatePlayerForm() {
  const router = useRouter();
  const session = useSession();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session.status === "anonymous") {
      router.replace("/login");
      return;
    }

    if (session.account?.player) {
      router.replace("/");
    }
  }, [router, session.account, session.status]);

  if (session.status === "loading" || session.status === "anonymous") {
    return (
      <main className="page-shell">
        <section className="panel">
          <p className="eyebrow">Player bootstrap</p>
          <h1>Preparing account</h1>
        </section>
      </main>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await session.createPlayer(displayName);
      router.replace("/");
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to create your player."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell auth-shell">
      <section className="panel auth-card">
        <p className="eyebrow">Player bootstrap</p>
        <h1>Create your player</h1>
        <p className="muted">
          Account auth is separate from player progression in this phase. Pick a
          unique display name to bind a player to this account.
        </p>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Display name</span>
            <input
              autoFocus
              maxLength={24}
              minLength={3}
              name="displayName"
              required
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>

          {error ? <p className="notice notice-error">{error}</p> : null}

          <button className="button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating player..." : "Create player"}
          </button>
        </form>
      </section>
    </main>
  );
}
