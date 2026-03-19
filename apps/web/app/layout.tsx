import type { Metadata } from "next";

import { AppProviders } from "../src/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mafia Game Prototype",
  description: "Usable frontend slice for auth and core gameplay integration"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
