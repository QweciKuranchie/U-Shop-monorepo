export const dynamic = "force-dynamic";

import Link from "next/link";
import { writeClient } from "@repo/sanity";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import LogLevelBadge from "@/components/LogLevelBadge";
import LogActions from "@/components/LogActions";

interface LogRow {
  _id: string;
  level: string;
  message: string;
  actorClerkId?: string;
  context?: string;
  createdAt: string;
}

const PAGE_SIZE = 25;
const LEVELS = ["all", "info", "warn", "error", "debug"];

function summarize(context?: string): string {
  if (!context) return "—";
  try {
    const obj = JSON.parse(context) as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (!keys.length) return "—";
    return keys.slice(0, 3).map((k) => `${k}: ${String(obj[k])}`).join(" · ") + (keys.length > 3 ? " …" : "");
  } catch {
    return context.slice(0, 80);
  }
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const level = LEVELS.includes(sp.level ?? "") && sp.level !== "all" ? sp.level! : null;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const filter = `_type == "adminLog" && (!defined($level) || level == $level)`;
  const params = { level, from: (page - 1) * PAGE_SIZE, to: page * PAGE_SIZE };

  let logs: LogRow[] = [];
  let total = 0;
  try {
    [logs, total] = await Promise.all([
      writeClient.fetch<LogRow[]>(
        `*[${filter}] | order(createdAt desc) [$from...$to]{ _id, level, message, actorClerkId, context, createdAt }`,
        params
      ),
      writeClient.fetch<number>(`count(*[${filter}])`, params),
    ]);
  } catch (error) {
    console.error("Error loading logs:", error);
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (l: string, p: number) => `/admin/logs?${new URLSearchParams({ level: l, page: String(p) })}`;

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-card border rounded-lg shadow-xs">
        <div>
          <h1 className="font-semibold text-lg">Activity Logs</h1>
          <p className="text-xs text-muted-foreground">
            Audit trail of admin actions and system events ({total} entries)
          </p>
        </div>
        <LogActions />
      </div>

      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => {
          const active = (level ?? "all") === l;
          return (
            <Link
              key={l}
              href={href(l, 1)}
              className={`rounded-full border px-3 py-1 text-xs capitalize ${
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {l}
            </Link>
          );
        })}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No log entries.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    <LogLevelBadge level={log.level} />
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium" title={log.message}>
                    {log.message}
                  </TableCell>
                  <TableCell className="max-w-sm truncate text-xs text-muted-foreground">
                    {summarize(log.context)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(log.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Link href={`/admin/logs/${log._id}`} className="mr-2 text-xs text-primary hover:underline">
                      Details
                    </Link>
                    <LogActions logId={log._id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={href(level ?? "all", page - 1)} className="rounded-md border px-3 py-1 hover:bg-muted">
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link href={href(level ?? "all", page + 1)} className="rounded-md border px-3 py-1 hover:bg-muted">
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
