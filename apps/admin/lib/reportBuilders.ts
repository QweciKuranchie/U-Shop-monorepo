import { computeAnalytics, type Analytics, type DateRange } from "./analytics";
import type { Section } from "./exportFiles";

export type ReportType = "sales" | "user_retention" | "all";
export type AnalyticsExportType = "overview" | "products" | "users" | "all";

export const REPORT_TYPES: ReportType[] = ["sales", "user_retention", "all"];
export const ANALYTICS_EXPORT_TYPES: AnalyticsExportType[] = ["overview", "products", "users", "all"];

const ghs = (n: number) => `GHS ${n.toFixed(2)}`;
const pct = (n: number | null) => (n === null ? "n/a" : `${n}%`);

function periodSection(a: Analytics): Section {
  return {
    title: "Period",
    columns: ["Field", "Value"],
    rows: [
      ["Range", a.range.label],
      ["From", a.range.start.slice(0, 10)],
      ["To", a.range.end.slice(0, 10)],
    ],
  };
}

function overviewSections(a: Analytics): Section[] {
  const o = a.overview;
  return [
    periodSection(a),
    {
      title: "Overview",
      columns: ["Metric", "Value", "Change vs previous period"],
      rows: [
        ["Total revenue", ghs(o.revenue), pct(o.changes.revenue)],
        ["Total orders", o.orders, pct(o.changes.orders)],
        ["Units sold", o.unitsSold, pct(o.changes.unitsSold)],
        ["Average order value", ghs(o.averageOrderValue), pct(o.changes.averageOrderValue)],
        ["Customers (buyers)", o.customers, pct(o.changes.customers)],
        ["New users", o.newUsers, pct(o.changes.newUsers)],
      ],
    },
    {
      title: "Monthly trends",
      columns: ["Month", "Revenue (GHS)", "Orders", "Units"],
      rows: a.monthlyTrends.map((m) => [m.label, m.revenue, m.orders, m.units]),
    },
    {
      title: "Order status",
      columns: ["Status", "Orders"],
      rows: a.statusDistribution.map((s) => [s.status, s.count]),
    },
  ];
}

function productSections(a: Analytics): Section[] {
  return [
    {
      title: "Top products",
      columns: ["Product", "Units sold", "Revenue (GHS)"],
      rows: a.topProducts.map((p) => [p.name, p.quantity, p.revenue]),
    },
    {
      title: "Revenue by category",
      columns: ["Category", "Units sold", "Revenue (GHS)"],
      rows: a.byCategory.map((c) => [c.category, c.units, c.revenue]),
    },
  ];
}

function userSections(a: Analytics): Section[] {
  const m = a.customerMetrics;
  return [
    {
      title: "Customer metrics",
      columns: ["Metric", "Value"],
      rows: [
        ["Buyers", a.overview.customers],
        ["New users", a.overview.newUsers],
        ["Repeat purchase rate", pct(m.repeatPurchaseRate)],
        ["Retention rate", pct(m.retentionRate)],
        ["Lifetime value (revenue per buyer)", ghs(m.lifetimeValue)],
      ],
    },
    {
      title: "Top customers",
      columns: ["Name", "Email", "Orders", "Total spent (GHS)"],
      rows: a.topCustomers.map((c) => [c.name, c.email, c.orders, c.spent]),
    },
  ];
}

export async function buildAnalyticsExport(
  type: AnalyticsExportType,
  range: DateRange
): Promise<{ title: string; sections: Section[] }> {
  const a = await computeAnalytics(range);
  const sections: Section[] = [];
  if (type === "overview" || type === "all") sections.push(...overviewSections(a));
  else sections.push(periodSection(a));
  if (type === "products" || type === "all") sections.push(...productSections(a));
  if (type === "users" || type === "all") sections.push(...userSections(a));
  return { title: `Analytics: ${type}`, sections };
}

export async function buildReport(
  type: ReportType,
  range: DateRange
): Promise<{ title: string; sections: Section[] }> {
  const a = await computeAnalytics(range);
  const o = a.overview;
  const sections: Section[] = [periodSection(a)];

  if (type === "sales" || type === "all") {
    sections.push(
      {
        title: "Sales summary",
        columns: ["Metric", "Value"],
        rows: [
          ["Total revenue", ghs(o.revenue)],
          ["Total orders", o.orders],
          ["Units sold", o.unitsSold],
          ["Average order value", ghs(o.averageOrderValue)],
        ],
      },
      ...productSections(a)
    );
  }
  if (type === "user_retention" || type === "all") sections.push(...userSections(a));

  const title =
    type === "sales" ? "Sales report" : type === "user_retention" ? "User retention report" : "Combined report";
  return { title, sections };
}
