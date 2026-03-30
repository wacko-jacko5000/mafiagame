"use client";

import { useState } from "react";

import { DashboardPage } from "./dashboard-page";
import { ProtectedView } from "./protected-view";
import { useSession } from "./session-provider";

type AuthMode = "login" | "register";

export function NeonClient() {
  const session = useSession();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleAuthSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    setIsBusy(true);
    setAuthError(null);

    try {
      if (authMode === "login") {
        await session.login(email, password);
      } else {
        await session.register(email, password);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreatePlayer(formData: FormData) {
    const displayName = String(formData.get("displayName") ?? "").trim();

    setIsBusy(true);
    setAuthError(null);

    try {
      await session.createPlayer(displayName);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to create player.");
    } finally {
      setIsBusy(false);
    }
  }

  if (session.status === "authenticated" && session.account?.player) {
    return (
      <ProtectedView
        subtitle="Control the city with the new shell, routes, and mobile nav."
        title="Dashboard"
      >
        <DashboardPage />
      </ProtectedView>
    );
  }

  return (
    <main className="neo-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="grid-lines" />

      <section className="hero-panel panel">
        <div className="hero-copy">
          <p className="kicker">Separate Frontend</p>
          <h1>Run the city from a screen that actually feels dangerous.</h1>
          <p className="hero-text">
            The new frontend now keeps the neon style but restores a real game structure:
            pages, navigation, and a mobile-friendly shell.
          </p>
        </div>

        <div className="hero-rail">
          {session.status === "loading" ? (
            <div className="panel inset-panel">
              <p className="section-label">Booting</p>
              <h2>Rebuilding your network</h2>
              <p className="muted">Session restoration is in progress. Hold the line.</p>
            </div>
          ) : session.status === "anonymous" ? (
            <div className="panel inset-panel">
              <div className="auth-toggle">
                <button
                  className={authMode === "login" ? "segment is-active" : "segment"}
                  onClick={() => setAuthMode("login")}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={authMode === "register" ? "segment is-active" : "segment"}
                  onClick={() => setAuthMode("register")}
                  type="button"
                >
                  Register
                </button>
              </div>

              <p className="section-label">Access Control</p>
              <h2>{authMode === "login" ? "Re-enter the underworld" : "Open a new account"}</h2>
              <form action={handleAuthSubmit} className="stack-form">
                <label className="field">
                  <span>Email</span>
                  <input name="email" placeholder="boss@district.io" required type="email" />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input
                    minLength={6}
                    name="password"
                    placeholder="Minimum 6 characters"
                    required
                    type="password"
                  />
                </label>
                {authError ? <p className="error-copy">{authError}</p> : null}
                <button className="action-button" disabled={isBusy} type="submit">
                  {isBusy ? "Working..." : authMode === "login" ? "Enter City Grid" : "Create Account"}
                </button>
              </form>
            </div>
          ) : (
            <div className="panel inset-panel">
              <p className="section-label">Identity Forge</p>
              <h2>Create the name the city will fear</h2>
              <form action={handleCreatePlayer} className="stack-form">
                <label className="field">
                  <span>Alias</span>
                  <input
                    maxLength={24}
                    minLength={3}
                    name="displayName"
                    placeholder="Nightwire, Gold Saint, Velvet Trigger"
                    required
                    type="text"
                  />
                </label>
                {authError ? <p className="error-copy">{authError}</p> : null}
                <button className="action-button" disabled={isBusy} type="submit">
                  {isBusy ? "Forging..." : "Claim Your Alias"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
