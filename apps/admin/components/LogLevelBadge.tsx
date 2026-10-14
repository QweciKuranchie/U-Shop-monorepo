import { cn } from "@repo/utils";

const STYLES: Record<string, string> = {
  error: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  warn: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  info: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  debug: "bg-muted text-muted-foreground border-border",
};

export default function LogLevelBadge({ level }: { level: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-max rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase",
        STYLES[level] ?? STYLES.debug
      )}
    >
      {level}
    </span>
  );
}
