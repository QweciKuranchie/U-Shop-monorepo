export const dynamic = "force-dynamic";

import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { getOrderYearRange } from "@/lib/analytics";

export default async function AnalyticsPage() {
  const { minYear, maxYear } = await getOrderYearRange().catch(() => {
    const y = new Date().getUTCFullYear();
    return { minYear: y, maxYear: y };
  });
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) years.push(y);

  return (
    <div className="py-4 space-y-6">
      <div className="px-4 py-3 bg-card border rounded-lg shadow-xs">
        <h1 className="font-semibold text-lg">Analytics</h1>
        <p className="text-xs text-muted-foreground">
          Revenue, orders, products and customers. Revenue excludes cancelled orders and failed or refunded payments.
        </p>
      </div>
      <AnalyticsDashboard years={years} />
    </div>
  );
}
