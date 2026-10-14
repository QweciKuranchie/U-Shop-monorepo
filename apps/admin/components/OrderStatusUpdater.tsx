"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@repo/ui";
import { ORDER_STATUS_OPTIONS } from "@repo/utils";

const PAYMENT_OPTIONS = ["pending", "paid", "failed", "refunded"];

export default function OrderStatusUpdater({
  orderId,
  orderStatus,
  paymentStatus,
}: {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(orderStatus);
  const [payment, setPayment] = useState(paymentStatus);
  const [busy, setBusy] = useState(false);
  const dirty = status !== orderStatus || payment !== paymentStatus;

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(status !== orderStatus ? { orderStatus: status } : {}),
          ...(payment !== paymentStatus ? { paymentStatus: payment } : {}),
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || "Update failed");
      toast.success("Order updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  const selectCls = "h-9 rounded-md border bg-background px-2 text-sm capitalize";
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-xs text-muted-foreground flex flex-col gap-1">
        Order status
        <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          {ORDER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.title}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-muted-foreground flex flex-col gap-1">
        Payment status
        <select className={selectCls} value={payment} onChange={(e) => setPayment(e.target.value)}>
          {PAYMENT_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <Button onClick={save} disabled={!dirty || busy}>
        {busy ? "Saving..." : "Update"}
      </Button>
    </div>
  );
}
