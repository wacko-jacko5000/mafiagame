"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError } from "../lib/api-client";
import { useSession } from "./providers/session-provider";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: Readonly<AuthFormProps>) {
  const router = useRouter();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isLogin) {
        await session.login(email, password);
      } else {
        await session.register(email, password);
      }

      router.replace(session.hasPlayer ? "/" : "/create-player");
    } catch (nextError) {
      setError(
        nextError instanceof ApiError
          ? nextError.message
          : "Unable to complete authentication."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell auth-shell">
      <section className="panel auth-card">
        <p className="eyebrow">Authentication</p>
        <h1>{isLogin ? "Sign in" : "Create account"}</h1>
        <p className="muted">
          {isLogin
            ? "Use the backend bearer-session auth flow and resume your account."
            : "Create an account first, then bootstrap a player explicitly."}
        </p>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={8}
              name="password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className="notice notice-error">{error}</p> : null}

          <button className="button" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? isLogin
                ? "Signing in..."
                : "Creating account..."
              : isLogin
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Need an account?" : "Already registered?"}{" "}
          <Link href={isLogin ? "/register" : "/login"}>
            {isLogin ? "Register" : "Sign in"}
          </Link>
        </p>
      </section>
    </main>
  );
}
