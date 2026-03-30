import { CrimesPage } from "../../src/components/crimes-page";
import { ProtectedView } from "../../src/components/protected-view";

export default function CrimesRoute() {
  return (
    <ProtectedView subtitle="Run the profitable moves and manage risk." title="Crimes">
      <CrimesPage />
    </ProtectedView>
  );
}
