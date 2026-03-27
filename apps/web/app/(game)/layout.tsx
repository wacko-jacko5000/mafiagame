import { CustodyOverlay } from "../../src/components/custody-overlay";
import { RouteGuard } from "../../src/components/route-guard";
import { PlayerStateProvider } from "../../src/components/providers/player-state-provider";

export default function GameLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RouteGuard requirePlayer>
      <PlayerStateProvider>
        {children}
        <CustodyOverlay />
      </PlayerStateProvider>
    </RouteGuard>
  );
}
