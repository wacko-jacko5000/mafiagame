import { AdminPage } from "../../src/components/admin-page";
import { RouteGuard } from "../../src/components/route-guard";

export default function AdminRoute() {
  return (
    <RouteGuard requireAdmin>
      <AdminPage />
    </RouteGuard>
  );
}
