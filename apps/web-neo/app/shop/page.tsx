import { ProtectedView } from "../../src/components/protected-view";
import { ShopPage } from "../../src/components/shop-page";

export default function ShopRoute() {
  return (
    <ProtectedView subtitle="Buy weapons, assets, and status upgrades." title="Shop">
      <ShopPage />
    </ProtectedView>
  );
}
