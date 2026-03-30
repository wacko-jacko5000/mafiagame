import { ActivityPage } from "../../src/components/activity-page";
import { ProtectedView } from "../../src/components/protected-view";

export default function ActivityRoute() {
  return (
    <ProtectedView subtitle="Review the latest actions hitting your feed." title="Activity">
      <ActivityPage />
    </ProtectedView>
  );
}
