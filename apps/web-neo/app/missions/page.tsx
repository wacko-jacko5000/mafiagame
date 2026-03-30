import { MissionsPage } from "../../src/components/missions-page";
import { ProtectedView } from "../../src/components/protected-view";

export default function MissionsRoute() {
  return (
    <ProtectedView subtitle="Track mission progress and payout pressure." title="Missions">
      <MissionsPage />
    </ProtectedView>
  );
}
