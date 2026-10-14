"use client";

import { Button } from "@repo/ui";
import { Checkbox } from "@repo/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui";
import { cn } from "@repo/utils";
import { OrderType } from "@/types/admin";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, User } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<OrderType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        checked={
          table.getIsAllPageRowsSelected() ||
          table.getIsSomePageRowsSelected()
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        checked={row.getIsSelected()}
      />
    ),
  },
  {
    accessorKey: "_id",
    header: "Order ID",
    cell: ({ row }) => {
      const id = row.original._id;
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {id.slice(0, 8)}...
        </span>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="font-medium text-sm">
          {row.getValue("email")}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.getValue("status") as string) || "pending";
      const isSuccess =
        status === "paid" || status === "success" || status === "delivered" || status === "completed";
      const isPending =
        status === "pending" || status === "processing";
      const isFailed =
        status === "failed" || status === "cancelled";

      return (
        <div
          className={cn(
            "px-2.5 py-0.5 rounded-full w-max text-xs font-medium capitalize",
            isSuccess && "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30",
            isPending && "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30",
            isFailed && "bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30"
          )}
        >
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Total Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
      }).format(amount / 100);

      return (
        <div className="text-right font-semibold text-sm">{formatted}</div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/orders/${order._id}`}>View details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order._id)}
            >
              Copy Order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {order.userId && (
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/users/${order.userId}`}
                  className="flex items-center gap-2"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>View Customer</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
