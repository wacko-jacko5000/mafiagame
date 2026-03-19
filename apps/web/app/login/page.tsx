"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthForm } from "../../src/components/auth-form";
import { useSession } from "../../src/components/providers/session-provider";

export default function LoginPage() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.status !== "authenticated") {
      return;
    }

    router.replace(session.account?.player ? "/" : "/create-player");
  }, [router, session.account, session.status]);

  if (session.status === "loading" || session.status === "authenticated") {
    return (
      <main className="page-shell">
        <section className="panel">
          <p className="eyebrow">Authentication</p>
          <h1>Loading session</h1>
        </section>
      </main>
    );
  }

  return <AuthForm mode="login" />;
}
