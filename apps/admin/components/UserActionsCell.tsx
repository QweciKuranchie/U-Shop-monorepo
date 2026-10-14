"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { MoreHorizontal } from "lucide-react";
import type { User } from "@clerk/nextjs/server";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";

export default function UserActionsCell({ user }: { user: User }) {
  const router = useRouter();
  const isAdminRole = (user.publicMetadata as { role?: string } | undefined)?.role === "admin";
  const [confirm, setConfirm] = useState<"role" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const res =
        confirm === "delete"
          ? await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
          : await fetch(`/api/admin/users/${user.id}/role`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: isAdminRole ? "user" : "admin" }),
            });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Request failed");
      toast.success(confirm === "delete" ? "User deleted" : isAdminRole ? "Admin access removed" : "Admin access granted");
      setConfirm(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || user.id;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>Copy user ID</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/admin/users/${user.id}`}>View customer</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setConfirm("role")}>
            {isAdminRole ? "Remove admin access" : "Make admin"}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onSelect={() => setConfirm("delete")}>
            Delete user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm === "delete" ? "Delete user?" : isAdminRole ? "Remove admin access?" : "Grant admin access?"}
            </DialogTitle>
            <DialogDescription>
              {confirm === "delete"
                ? `${name} will be permanently deleted from Clerk. This cannot be undone.`
                : isAdminRole
                  ? `${name} will lose access to this dashboard (unless they are on the ADMIN_EMAILS allow-list).`
                  : `${name} will be able to manage products, orders, users and settings.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button variant={confirm === "delete" || isAdminRole ? "destructive" : "default"} disabled={busy} onClick={run}>
              {busy ? "Working..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
