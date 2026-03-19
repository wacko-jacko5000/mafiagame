"use client";

import { SessionProvider } from "./session-provider";

export function AppProviders({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return <SessionProvider>{children}</SessionProvider>;
}
