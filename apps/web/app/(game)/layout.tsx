import { RouteGuard } from "../../src/components/route-guard";

export default function GameLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return <RouteGuard requirePlayer>{children}</RouteGuard>;
}
