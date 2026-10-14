export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { writeClient } from "@repo/sanity";
import LogLevelBadge from "@/components/LogLevelBadge";
import LogActions from "@/components/LogActions";

interface LogDoc {
  _id: string;
  level: string;
  message: string;
  actorClerkId?: string;
  context?: string;
  createdAt: string;
}

export default async function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const log = await writeClient
    .fetch<LogDoc | null>(
      `*[_type == "adminLog" && _id == $id][0]{ _id, level, message, actorClerkId, context, createdAt }`,
      { id }
    )
    .catch(() => null);
  if (!log) notFound();

  let context: Record<string, unknown> = {};
  if (log.context) {
    try {
      context = JSON.parse(log.context);
    } catch {
      context = { raw: log.context };
    }
  }

  return (
    <div className="py-4 space-y-6 max-w-3xl">
      <Link href="/admin/logs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to logs
      </Link>

      <section className="bg-card border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Log details</h1>
          <LogActions logId={log._id} redirectTo="/admin/logs" />
        </div>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
          <dt className="text-muted-foreground">Level</dt>
          <dd><LogLevelBadge level={log.level} /></dd>
          <dt className="text-muted-foreground">Message</dt>
          <dd>{log.message}</dd>
          <dt className="text-muted-foreground">Time</dt>
          <dd>{new Date(log.createdAt).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "medium" })}</dd>
          <dt className="text-muted-foreground">Actor</dt>
          <dd className="font-mono text-xs">{log.actorClerkId ?? "system"}</dd>
          <dt className="text-muted-foreground">Log ID</dt>
          <dd className="font-mono text-xs break-all">{log._id}</dd>
        </dl>
      </section>

      <section className="bg-card border rounded-lg p-4 space-y-3">
        <h2 className="font-medium">Context</h2>
        {Object.keys(context).length === 0 ? (
          <p className="text-sm text-muted-foreground">No context available.</p>
        ) : (
          <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
            {Object.entries(context).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-mono text-xs break-all whitespace-pre-wrap">
                  {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}
