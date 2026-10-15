"use client";

import { useEffect, useState } from "react";
import { BarChart2, DollarSign, UserPlus, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@repo/ui";
import type { Analytics } from "@/lib/analytics";
import StatsCard from "./StatsCard";
import ListCard from "./ListCard";

const PERIODS = [
  { value: "last7days", label: "Last 7 days" },
  { value: "lastMonth", label: "Last month" },
  { value: "lastYear", label: "Last year" },
  { value: "allTime", label: "All time" },
] as const;

const ghs = (n: number) =>
  `GH₵ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, 1)).toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });
};

const revenueConfig = { revenue: { label: "Revenue (GH₵)", color: "#22c55e" } } satisfies ChartConfig;
const productsConfig = { revenue: { label: "Revenue (GH₵)", color: "#4f46e5" } } satisfies ChartConfig;

const DashboardOverview = () => {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["value"]>("allTime");
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/admin/analytics?timePeriod=${period}`, { signal: ctrl.signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load analytics");
        setData(json);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message || "Failed to load analytics");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [period]);

  const o = data?.overview;
  const trend = (data?.monthlyTrends ?? []).map((t) => ({ ...t, month: monthLabel(t.label) }));
  const products = (data?.topProducts ?? []).slice(0, 8).map((p) => ({
    ...p,
    short: p.name.length > 16 ? `${p.name.slice(0, 15)}…` : p.name,
  }));
  const caption = period === "allTime" ? undefined : "vs previous period";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-xl font-semibold sm:text-2xl">Dashboard overview</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="period" className="text-sm text-muted-foreground">Time period</label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="h-10 rounded-lg border bg-card px-3 text-sm"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          Could not load the dashboard: {error}. Refresh the page or choose another time period.
        </div>
      ) : (
        <div className={loading && data ? "opacity-60 transition-opacity" : ""} aria-busy={loading}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total revenue" value={o ? ghs(o.revenue) : "…"} percentage={o ? o.changes.revenue : null} caption={caption} icon={<DollarSign className="h-5 w-5" />} />
            <StatsCard title="Orders" value={o ? o.orders : "…"} percentage={o ? o.changes.orders : null} caption={caption} icon={<BarChart2 className="h-5 w-5" />} />
            <StatsCard title="Customers" value={o ? o.customers : "…"} percentage={o ? o.changes.customers : null} caption={caption} icon={<Users className="h-5 w-5" />} />
            <StatsCard title="New users" value={o ? o.newUsers : "…"} percentage={o ? o.changes.newUsers : null} caption={caption} icon={<UserPlus className="h-5 w-5" />} />
          </div>

          <section className="mt-6 rounded-xl border bg-card p-5 shadow-xs">
            <h2 className="mb-4 text-lg font-semibold">Revenue trends</h2>
            {trend.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">{loading ? "Loading…" : "No paid orders in this period yet."}</p>
            ) : (
              <ChartContainer config={revenueConfig} className="min-h-[260px] w-full">
                <AreaChart accessibilityLayer data={trend}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} width={56} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area dataKey="revenue" type="monotone" stroke="#22c55e" strokeWidth={2} fill="url(#fillRevenue)" />
                </AreaChart>
              </ChartContainer>
            )}
          </section>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border bg-card p-5 shadow-xs">
              <h2 className="mb-4 text-lg font-semibold">Sales by product</h2>
              {products.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">{loading ? "Loading…" : "No product sales in this period yet."}</p>
              ) : (
                <ChartContainer config={productsConfig} className="min-h-[260px] w-full">
                  <BarChart accessibilityLayer data={products}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="short" tickLine={false} axisLine={false} tickMargin={10} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis tickLine={false} axisLine={false} width={56} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </section>
            <ListCard
              title="Top products"
              viewAllHref="/admin/products"
              emptyText="No products sold in this period."
              items={(data?.topProducts ?? []).slice(0, 6).map((p) => ({
                id: p.id,
                name: p.name,
                subtitle: `${p.quantity} sold`,
                primary: ghs(p.revenue),
              }))}
            />
          </div>

          <div className="mt-6">
            <ListCard
              title="Top customers"
              viewAllHref="/admin/users"
              emptyText="No customer orders in this period."
              items={(data?.topCustomers ?? []).slice(0, 6).map((c) => ({
                id: c.clerkUserId,
                name: c.name || c.email || "Customer",
                subtitle: c.email,
                primary: ghs(c.spent),
                secondary: `${c.orders} order${c.orders === 1 ? "" : "s"}`,
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
