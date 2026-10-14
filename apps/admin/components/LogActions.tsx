"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";
import { Button } from "@repo/ui";

/** Delete a single log (`logId`) or, without `logId`, clear all logs. */
export default function LogActions({ logId, redirectTo }: { logId?: string; redirectTo?: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const url = logId ? `/api/admin/logs/${logId}` : "/api/admin/logs?confirm=true";
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || "Request failed");
      toast.success(logId ? "Log deleted" : "All logs cleared");
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">{logId ? "Delete this log?" : "Clear ALL logs?"}</span>
        <Button size="sm" variant="destructive" disabled={busy} onClick={run}>
          {busy ? "Working..." : "Yes"}
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant={logId ? "ghost" : "outline"}
      onClick={() => setConfirming(true)}
      aria-label={logId ? "Delete log" : "Clear all logs"}
    >
      <Trash2 className="h-4 w-4" />
      {!logId && <span className="ml-1">Clear all logs</span>}
    </Button>
  );
}
