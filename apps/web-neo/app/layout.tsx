import type { ReactNode } from "react";
import type { Metadata } from "next";

import { AppProviders } from "../src/components/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mafia Game Neon Frontend",
  description: "A separate cinematic frontend for the Mafia Game backend."
};

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
