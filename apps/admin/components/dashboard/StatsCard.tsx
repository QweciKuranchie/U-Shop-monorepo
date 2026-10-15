import { TrendingDown, TrendingUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  /** Change vs the previous period; null when there is nothing to compare with. */
  percentage: number | null;
  caption?: string;
  icon?: React.ReactNode;
}

const StatsCard = ({ title, value, percentage, caption, icon }: StatsCardProps) => {
  const positive = (percentage ?? 0) >= 0;
  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && (
          <div className="rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold tabular-nums">{value}</div>
      <div className="flex items-center gap-2 text-sm">
        {percentage === null ? (
          <span className="text-xs text-muted-foreground">No earlier period to compare</span>
        ) : (
          <>
            <span
              className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                positive
                  ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
              }`}
            >
              {positive ? <TrendingUp className="mr-1 h-3 w-3" aria-hidden="true" /> : <TrendingDown className="mr-1 h-3 w-3" aria-hidden="true" />}
              {Math.abs(percentage)}%
              <span className="sr-only">{positive ? " increase" : " decrease"}</span>
            </span>
            {caption && <span className="text-muted-foreground">{caption}</span>}
          </>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
