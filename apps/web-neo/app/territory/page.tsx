import { ProtectedView } from "../../src/components/protected-view";
import { TerritoryPage } from "../../src/components/territory-page";

export default function TerritoryRoute() {
  return (
    <ProtectedView subtitle="Scan district control, payouts, and wars." title="Territory">
      <TerritoryPage />
    </ProtectedView>
  );
}
