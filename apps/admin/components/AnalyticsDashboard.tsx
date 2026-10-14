"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ArrowDownRight, ArrowUpRight, Download, Minus } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  Button,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui";
import type { Analytics } from "@/lib/analytics";
import { downloadFromApi } from "@/lib/download";
import PeriodControls, { DEFAULT_PERIOD, periodToParams, validatePeriod, type PeriodState } from "./PeriodControls";

const ghs = (n: number) => new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(n);

function Stat({ label, value, change }: { label: string; value: string; change: number | null }) {
  const Icon = change === null || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
  const tone = change === null || change === 0 ? "text-muted-foreground" : change > 0 ? "text-green-600" : "text-red-600";
  return (
    <div className="rounded-lg border bg-card p-4 shadow-xs">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className={`mt-1 flex items-center gap-1 text-xs ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
        {change === null ? "No previous period" : `${change > 0 ? "+" : ""}${change}% vs previous period`}
      </p>
    </div>
  );
}

const trendConfig = {
  revenue: { label: "Revenue (GHS)", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-4)" },
} satisfies ChartConfig;

const productConfig = {
  quantity: { label: "Units sold", color: "var(--chart-2)" },
} satisfies ChartConfig;

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function AnalyticsDashboard({ years }: { years: number[] }) {
  const [period, setPeriod] = useState<PeriodState>(DEFAULT_PERIOD);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportType, setExportType] = useState("all");
  const [exportFormat, setExportFormat] = useState("csv");
  const [exporting, setExporting] = useState(false);

  const query = useMemo(() => periodToParams(period).toString(), [period]);
  const invalid = validatePeriod(period);

  useEffect(() => {
    if (invalid) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/admin/analytics?${query}`, { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load analytics");
        setData(json);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, invalid]);

  async function exportData() {
    if (invalid) return toast.error(invalid);
    setExporting(true);
    try {
      await downloadFromApi(
        `/api/admin/analytics/export?${query}&type=${exportType}&format=${exportFormat}`,
        `analytics-${exportType}.${exportFormat}`
      );
      toast.success("Export downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const field = "h-9 rounded-md border bg-background px-2 text-sm";
  const o = data?.overview;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border bg-card p-4 shadow-xs">
        <PeriodControls value={period} onChange={setPeriod} years={years} />
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Export
            <select className={field} value={exportType} onChange={(e) => setExportType(e.target.value)}>
              <option value="all">All</option>
              <option value="overview">Overview</option>
              <option value="products">Products</option>
              <option value="users">Users</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Format
            <select className={field} value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
              <option value="csv">CSV</option>
              <option value="xlsx">XLSX</option>
              <option value="pdf">PDF</option>
            </select>
          </label>
          <Button onClick={exportData} disabled={exporting || !!invalid}>
            <Download className="mr-1 h-4 w-4" />
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {invalid && <p className="text-sm text-amber-600">{invalid}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && !data && <p className="text-sm text-muted-foreground">Loading analytics...</p>}

      {data && o && (
        <div className={loading ? "space-y-6 opacity-60 transition-opacity" : "space-y-6"}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Total revenue" value={ghs(o.revenue)} change={o.changes.revenue} />
            <Stat label="Total orders" value={String(o.orders)} change={o.changes.orders} />
            <Stat label="Units sold" value={String(o.unitsSold)} change={o.changes.unitsSold} />
            <Stat label="Average order value" value={ghs(o.averageOrderValue)} change={o.changes.averageOrderValue} />
            <Stat label="Customers (buyers)" value={String(o.customers)} change={o.changes.customers} />
            <Stat label="New users" value={String(o.newUsers)} change={o.changes.newUsers} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Repeat purchase rate</p>
              <p className="mt-1 text-xl font-semibold">{data.customerMetrics.repeatPurchaseRate}%</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Retention rate</p>
              <p className="mt-1 text-xl font-semibold">
                {data.customerMetrics.retentionRate === null ? "n/a" : `${data.customerMetrics.retentionRate}%`}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs text-muted-foreground">Lifetime value (revenue / buyer)</p>
              <p className="mt-1 text-xl font-semibold">{ghs(data.customerMetrics.lifetimeValue)}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border bg-card p-4">
              <h2 className="mb-4 font-medium">Revenue &amp; orders by month</h2>
              {data.monthlyTrends.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders in this period.</p>
              ) : (
                <ChartContainer config={trendConfig} className="min-h-[240px] w-full">
                  <AreaChart accessibilityLayer data={data.monthlyTrends}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area dataKey="revenue" type="monotone" fill="var(--color-revenue)" fillOpacity={0.25} stroke="var(--color-revenue)" />
                    <Area dataKey="orders" type="monotone" fill="var(--color-orders)" fillOpacity={0.25} stroke="var(--color-orders)" />
                  </AreaChart>
                </ChartContainer>
              )}
            </section>

            <section className="rounded-lg border bg-card p-4">
              <h2 className="mb-4 font-medium">Order status</h2>
              {data.statusDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders in this period.</p>
              ) : (
                <ChartContainer config={{}} className="min-h-[240px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                    <Pie data={data.statusDistribution} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90}>
                      {data.statusDistribution.map((s, i) => (
                        <Cell key={s.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              )}
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {data.statusDistribution.map((s, i) => (
                  <li key={s.status} className="flex items-center gap-1 capitalize">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {s.status.replace(/_/g, " ")} ({s.count})
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border bg-card p-4">
              <h2 className="mb-4 font-medium">Top products by units sold</h2>
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales in this period.</p>
              ) : (
                <ChartContainer config={productConfig} className="min-h-[260px] w-full">
                  <BarChart accessibilityLayer data={data.topProducts} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={110}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
                    />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="quantity" fill="var(--color-quantity)" radius={4} />
                  </BarChart>
                </ChartContainer>
              )}
            </section>

            <section className="rounded-lg border bg-card p-4">
              <h2 className="mb-4 font-medium">Revenue by category</h2>
              {data.byCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales in this period.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.byCategory.slice(0, 8).map((c) => (
                    <li key={c.category} className="flex items-center justify-between gap-4">
                      <span className="truncate">{c.category}</span>
                      <span className="whitespace-nowrap text-muted-foreground">
                        {c.units} units · <span className="font-medium text-foreground">{ghs(c.revenue)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-4 font-medium">Top customers</h2>
            {data.topCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customers in this period.</p>
            ) : (
              <ul className="divide-y text-sm">
                {data.topCustomers.map((c) => (
                  <li key={c.clerkUserId} className="flex items-center justify-between gap-4 py-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{ghs(c.spent)}</p>
                      <p className="text-xs text-muted-foreground">{c.orders} orders</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
