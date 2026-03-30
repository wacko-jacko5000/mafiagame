import { LeaderboardPage } from "../../src/components/leaderboard-page";
import { ProtectedView } from "../../src/components/protected-view";

export default function LeaderboardRoute() {
  return (
    <ProtectedView subtitle="See who owns the city right now." title="Leaderboard">
      <LeaderboardPage />
    </ProtectedView>
  );
}
