"use client";

import type { ReactNode } from "react";

import { SessionProvider } from "./session-provider";

export function AppProviders({
  children
}: Readonly<{ children: ReactNode }>) {
  return <SessionProvider>{children}</SessionProvider>;
}
