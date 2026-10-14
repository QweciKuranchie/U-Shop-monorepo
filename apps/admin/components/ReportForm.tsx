"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { FileDown } from "lucide-react";
import { Button } from "@repo/ui";
import { downloadFromApi } from "@/lib/download";
import PeriodControls, { periodToParams, validatePeriod, type PeriodState } from "./PeriodControls";

export default function ReportForm({ years }: { years: number[] }) {
  const [type, setType] = useState("sales");
  const [format, setFormat] = useState("pdf");
  const [period, setPeriod] = useState<PeriodState>({ timePeriod: "last7days", year: "", startDate: "", endDate: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validatePeriod(period);
    if (invalid) return setMessage({ kind: "error", text: invalid });
    setMessage(null);
    setBusy(true);
    try {
      const sp = periodToParams(period);
      sp.set("type", type);
      sp.set("format", format);
      await downloadFromApi(`/api/admin/reports/generate?${sp}`, `${type}-report.${format}`);
      setMessage({ kind: "ok", text: "Report generated and downloaded." });
      toast.success("Report downloaded");
    } catch (err) {
      const text = err instanceof Error ? err.message : "Failed to generate report";
      setMessage({ kind: "error", text });
      toast.error(text);
    } finally {
      setBusy(false);
    }
  }

  const field = "h-9 rounded-md border bg-background px-2 text-sm";
  return (
    <form onSubmit={submit} className="space-y-5 rounded-lg border bg-card p-5 shadow-xs max-w-3xl">
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Report type
          <select className={field} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="sales">Sales</option>
            <option value="user_retention">User retention</option>
            <option value="all">All reports</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Format
          <select className={field} value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
          </select>
        </label>
      </div>
      <PeriodControls value={period} onChange={setPeriod} years={years} />
      {message && <p className={`text-sm ${message.kind === "ok" ? "text-green-600" : "text-red-600"}`}>{message.text}</p>}
      <Button type="submit" disabled={busy}>
        <FileDown className="mr-1 h-4 w-4" />
        {busy ? "Generating..." : "Generate report"}
      </Button>
    </form>
  );
}
