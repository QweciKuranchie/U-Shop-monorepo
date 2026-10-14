"use client";

export interface PeriodState {
  timePeriod: string;
  year: string;
  startDate: string;
  endDate: string;
}

export const DEFAULT_PERIOD: PeriodState = { timePeriod: "lastMonth", year: "", startDate: "", endDate: "" };

export function periodToParams(p: PeriodState): URLSearchParams {
  const sp = new URLSearchParams({ timePeriod: p.timePeriod });
  if (p.timePeriod === "year" && p.year) sp.set("year", p.year);
  if (p.timePeriod === "custom") {
    if (p.startDate) sp.set("startDate", p.startDate);
    if (p.endDate) sp.set("endDate", p.endDate);
  }
  return sp;
}

/** Returns an error message if the selection is incomplete, else null. */
export function validatePeriod(p: PeriodState): string | null {
  if (p.timePeriod === "year" && !p.year) return "Choose a year";
  if (p.timePeriod === "custom") {
    if (!p.startDate || !p.endDate) return "Choose both a start and end date";
    if (p.startDate > p.endDate) return "Start date must be on or before the end date";
  }
  return null;
}

const OPTIONS = [
  ["last7days", "Last 7 days"],
  ["lastMonth", "Last month"],
  ["lastYear", "Last year"],
  ["year", "Specific year"],
  ["allTime", "All time"],
  ["custom", "Custom range"],
] as const;

export default function PeriodControls({
  value,
  onChange,
  years,
}: {
  value: PeriodState;
  onChange: (next: PeriodState) => void;
  years: number[];
}) {
  const field = "h-9 rounded-md border bg-background px-2 text-sm";
  const set = (patch: Partial<PeriodState>) => onChange({ ...value, ...patch });
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Time period
        <select className={field} value={value.timePeriod} onChange={(e) => set({ timePeriod: e.target.value })}>
          {OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      {value.timePeriod === "year" && (
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Year
          <select className={field} value={value.year} onChange={(e) => set({ year: e.target.value })}>
            <option value="">Select…</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
      )}
      {value.timePeriod === "custom" && (
        <>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Start date
            <input type="date" className={field} value={value.startDate} onChange={(e) => set({ startDate: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            End date
            <input
              type="date"
              className={field}
              value={value.endDate}
              min={value.startDate || undefined}
              onChange={(e) => set({ endDate: e.target.value })}
            />
          </label>
        </>
      )}
    </div>
  );
}
