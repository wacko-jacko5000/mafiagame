import { GangsPage } from "../../src/components/gangs-page";
import { ProtectedView } from "../../src/components/protected-view";

export default function GangsRoute() {
  return (
    <ProtectedView subtitle="Track crew affiliation and pressure." title="Gangs">
      <GangsPage />
    </ProtectedView>
  );
}
